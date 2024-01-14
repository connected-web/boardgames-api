import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { verifyAdminScope } from '../helpers/userScopes'
import getObject from '../helpers/aws/getObject'
import { PlayRecordType } from '../../models/ApiModels'

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, getBucketName } = interfaces.get()

  const playRecordKey = decodeURIComponent(event?.pathParameters?.playRecordKey ?? '')
  if (playRecordKey.length === 0) {
    console.error('[View Play Record] No play record key provided')
    return errorResponse(HTTP_CODES.clientError, 'No play record key provided')
  }

  const unauthorized = verifyAdminScope(event)
  if (unauthorized != null) {
    return unauthorized
  }

  let existingRecord: PlayRecordType
  try {
    const bucket = getBucketName()
    const existingBody = await getObject({
      Bucket: bucket,
      Key: playRecordKey
    })
    existingRecord = JSON.parse(existingBody)
  } catch (err) {
    const error = err as Error
    console.log('[View Play Record] Unable to retrieve existing record:', error.message, { playRecordKey })
    return errorResponse(HTTP_CODES.serverError, `Unable to retrieve existing record: ${error.message}; playRecordKey: (${playRecordKey})`)
  }

  return successResponse(existingRecord)
}
