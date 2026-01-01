import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { verifyAdminScope } from '../helpers/userScopes'
import getObject from '../helpers/aws/getObject'
import { PlayRecordType } from '../../models/ApiModels'
import deleteObject from '../helpers/aws/deleteObject'
import { resolvePlayRecordYearMonth } from '../helpers/playrecords/date'

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, putObject, now, getBucketName } = interfaces.get()

  const unauthorized = verifyAdminScope(event)
  if (unauthorized != null) {
    return unauthorized
  }

  let payload
  try {
    if (typeof event?.body === 'string') {
      payload = JSON.parse(event.body)
    } else {
      throw new Error('No body provided in event')
    }
  } catch (ex) {
    const error = ex as Error
    console.error('[Update Play Record] Unable to parse payload', error.message)
    return errorResponse(HTTP_CODES.clientError, `Unable to parse payload - expected JSON: ${error.message}`)
  }

  let existingRecord: PlayRecordType
  try {
    const bucket = getBucketName()
    const existingBody = await getObject({
      Bucket: bucket,
      Key: payload.key
    })
    existingRecord = JSON.parse(existingBody)
  } catch (err) {
    const error = err as Error
    console.log('[Update Play Record] Unable to retrieve existing record:', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to retrieve existing record: ${error.message}`)
  }

  // Generate S3 key e.g. 2021-12-01T23:11:25.556Z.json
  const currentDate: Date = now()
  const { year, month } = resolvePlayRecordYearMonth(payload?.date, currentDate)
  const originalFilename = payload.key.split('/').pop()
  const updatedKeypath = ['playrecords', year, month, originalFilename].join('/')

  // Store history of record with record
  const history = existingRecord?.history ?? []
  const shallowCopy = { ...existingRecord }
  delete shallowCopy.history
  history.push(shallowCopy)
  const updatedPayload = { ...payload, history }
  const payloadBody = JSON.stringify(updatedPayload)

  try {
    const bucket = getBucketName()
    await putObject({
      Bucket: bucket,
      Key: updatedKeypath,
      Body: payloadBody,
      ContentType: 'application/json; charset=utf-8'
    })
    console.log(`[Update Play Record] Successfully stored ${payloadBody.length} bytes in ${bucket}, ${updatedKeypath}`)
  } catch (err) {
    const error = err as Error
    console.log('[Update Play Record] Unable to store payload:', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to store payload: ${error.message}`)
  }

  if (payload.key !== updatedKeypath) {
    console.log('[Update Play Record] Key path has changed, deleting original payload')
    try {
      const bucket = getBucketName()
      await deleteObject({
        Bucket: bucket,
        Key: payload.key
      })
    } catch (err) {
      const error = err as Error
      console.log('[Update Play Record] Unable to delete original payload:', error.message)
      return errorResponse(HTTP_CODES.serverError, `Unable to delete original payload: ${error.message}`)
    }
  }

  const updateMessage = 'Successfully updated play record'
  const movedAndUpdatedMessage = 'Successfully updated play record, original record removed and stored in history of new record'
  const message = payload.key === updatedKeypath ? updateMessage : movedAndUpdatedMessage

  return successResponse({
    message,
    year,
    month,
    filename: originalFilename,
    keypath: updatedKeypath,
    payload
  })
}
