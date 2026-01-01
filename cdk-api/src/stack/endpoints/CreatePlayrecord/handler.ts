import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { verifyAdminScope } from '../helpers/userScopes'
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
    console.error('[Create Play Record] Unable to parse payload', error.message)
    return errorResponse(HTTP_CODES.clientError, `Unable to parse payload - expected JSON: ${error.message}`)
  }

  // Generate S3 key e.g. 2021-12-01T23:11:25.556Z.json
  const currentDate: Date = now()
  const { year, month } = resolvePlayRecordYearMonth(payload?.date, currentDate)
  const filename = `${currentDate.toISOString()}.json`
  const keypath = ['playrecords', year, month, filename].join('/')
  const payloadBody = JSON.stringify(payload)

  try {
    const bucket = getBucketName()
    await putObject({
      Bucket: bucket,
      Key: keypath,
      Body: payloadBody,
      ContentType: 'application/json; charset=utf-8'
    })
    console.log(`[Create Play Record] Successfully stored ${payloadBody.length} bytes in ${bucket}, ${keypath}`)
  } catch (err) {
    const error = err as Error
    console.log('[Create Play Record] Error', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to store payload: ${error.message}`)
  }

  return successResponse({
    message: 'Stored play data successfully',
    year,
    month,
    filename,
    keypath,
    payload
  })
}
