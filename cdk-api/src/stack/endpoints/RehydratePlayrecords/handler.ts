import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { verifyAdminScope } from '../helpers/userScopes'
import { resolvePlayRecordYearMonth } from '../helpers/playrecords/date'
import { getPlayRecordsByMonth } from '../helpers/playrecords/helpers'

interface RehydratePayload {
  dryRun?: boolean
  maxKeys?: number
  prefix?: string
  rebuildYear?: string | number
  rebuildTouched?: boolean
}

interface MoveResult {
  from: string
  to: string
}

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, listObjects, getObject, putObject, deleteObject, getBucketName, now } = interfaces.get()

  const unauthorized = verifyAdminScope(event)
  if (unauthorized != null) {
    return unauthorized
  }

  let payload: RehydratePayload = {}
  try {
    if (typeof event?.body === 'string' && event.body.length > 0) {
      payload = JSON.parse(event.body)
    }
  } catch (ex) {
    const error = ex as Error
    console.error('[Rehydrate Play Records] Unable to parse payload', error.message)
    return errorResponse(HTTP_CODES.clientError, `Unable to parse payload - expected JSON: ${error.message}`)
  }

  const dryRun = payload?.dryRun === true
  const maxKeys = Number.isInteger(payload?.maxKeys) ? (payload?.maxKeys as number) : undefined
  const prefix = (typeof payload?.prefix === 'string' && payload.prefix.length > 0) ? payload.prefix : 'playrecords/'
  const rebuildTouched = payload?.rebuildTouched === true
  const rebuildYear = (typeof payload?.rebuildYear === 'string' && payload.rebuildYear.length > 0)
    ? payload.rebuildYear
    : (typeof payload?.rebuildYear === 'number' ? `${payload.rebuildYear}` : undefined)

  const bucket = getBucketName()
  const movedKeys: MoveResult[] = []
  const touchedMonths = new Set<string>()
  const errors: string[] = []
  let scanned = 0
  let moved = 0
  let skipped = 0
  let invalidDate = 0

  console.log(`[Rehydrate Play Records] Starting scan for prefix: ${prefix} dryRun=${String(dryRun)} maxKeys=${maxKeys ?? 'none'}`)

  let continuationToken: string | undefined
  let reachedLimit = false
  try {
    for (;;) {
      const listResponse = await listObjects({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
      const recordList = listResponse?.Contents ?? []

      for (const item of recordList) {
        const key = item?.Key
        if (key == null || key.length === 0) {
          continue
        }
        if (maxKeys != null && scanned >= maxKeys) {
          reachedLimit = true
          break
        }
        const isJson = key.endsWith('.json')
        const isApiKey = key.includes('apiKeys')
        const isGrouped = key.includes('grouped/')
        if (!isJson || isApiKey || isGrouped) {
          continue
        }

        scanned++
        let recordBody = ''
        let recordData: any
        try {
          recordBody = await getObject({ Bucket: bucket, Key: key })
          recordData = JSON.parse(recordBody)
        } catch (ex) {
          const error = ex as Error
          errors.push(`[Rehydrate Play Records] Unable to read ${key}: ${error.message}`)
          continue
        }

        const { year, month, valid } = resolvePlayRecordYearMonth(recordData?.date, now())
        if (!valid) {
          invalidDate++
          continue
        }
        touchedMonths.add(`${year}-${month}`)

        const filename = key.split('/').pop() ?? 'filename-not-set'
        const expectedKey = ['playrecords', year, month, filename].join('/')
        if (expectedKey === key) {
          skipped++
          continue
        }

        moved++
        if (!dryRun) {
          await putObject({
            Bucket: bucket,
            Key: expectedKey,
            Body: recordBody,
            ContentType: 'application/json; charset=utf-8'
          })
          await deleteObject({
            Bucket: bucket,
            Key: key
          })
        }

        if (movedKeys.length < 50) {
          movedKeys.push({ from: key, to: expectedKey })
        }
      }

      continuationToken = listResponse.NextContinuationToken
      if (reachedLimit || continuationToken == null || continuationToken.length === 0) {
        break
      }
    }
  } catch (ex) {
    const error = ex as Error
    return errorResponse(HTTP_CODES.serverError, `Unable to rehydrate play records: ${error.message}`)
  }

  if (!dryRun && (rebuildTouched || rebuildYear != null)) {
    const monthsToRebuild: string[] = []
    if (rebuildYear != null) {
      for (let month = 1; month <= 12; month += 1) {
        const monthCode = month >= 10 ? `${month}` : `0${month}`
        monthsToRebuild.push(`${rebuildYear}-${monthCode}`)
      }
    } else {
      monthsToRebuild.push(...Array.from(touchedMonths))
    }

    for (const dateCode of monthsToRebuild) {
      try {
        await getPlayRecordsByMonth(dateCode, true)
      } catch (ex) {
        const error = ex as Error
        errors.push(`[Rehydrate Play Records] Unable to rebuild cache for ${dateCode}: ${error.message}`)
      }
    }
  }

  const message = dryRun
    ? 'Dry run complete - no records moved.'
    : 'Rehydration complete - records moved if needed.'

  return successResponse({
    message,
    dryRun,
    prefix,
    scanned,
    moved,
    skipped,
    invalidDate,
    rebuildTouched,
    rebuildYear,
    movedKeys,
    errors: errors.slice(0, 50)
  })
}
