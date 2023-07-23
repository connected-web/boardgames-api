import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, deleteObject, getBucketName } = interfaces.get()

  const userGroups: string = event.requestContext.authorizer?.groups ?? ''
  if (!userGroups.includes('BoardGamesBrowserAdmins')) {
    return errorResponse(HTTP_CODES.clientForbidden, 'User is authenticated, but not in an authorized user group for this action')
  }

  let payload: { keypath: string }
  try {
    if (typeof event?.body === 'string') {
      payload = JSON.parse(event.body)
    } else {
      throw new Error('No body provided in event')
    }
  } catch (ex) {
    const error = ex as Error
    console.error('[Delete Play Record] Unable to parse payload', error.message)
    return errorResponse(HTTP_CODES.clientError, `Unable to parse payload - expected JSON: ${error.message}`)
  }

  const keypath: string = payload?.keypath
  if (keypath === undefined || keypath === '') {
    const errorMessage = `Unable to delete play record: Empty keypath provided in payload (${keypath})`
    console.log('[Delete Play Record] Client error', errorMessage)
    return errorResponse(HTTP_CODES.clientError, errorMessage)
  }

  try {
    const bucket = getBucketName()
    await deleteObject({
      Bucket: bucket,
      Key: keypath
    })
    console.log(`[Delete Play Record] Successfully removed ${keypath} from ${bucket}`)
  } catch (err) {
    const error = err as Error
    console.log('[Delete Play Record] Error', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to delete play record: ${error.message}`)
  }

  return successResponse({
    message: 'Play record deleted successfully',
    keypath
  })
}
