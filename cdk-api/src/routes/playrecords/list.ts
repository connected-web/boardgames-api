import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { JsonObject } from '../helpers/getJson'
import { getPlayRecordsByAllTime } from './shared/helpers'

interface ListPlayRecordsResponse {
  playRecords: JsonObject[]
}

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const forceUpdate = event.queryStringParameters?.forceUpdate === 'true'
  const result: ListPlayRecordsResponse = { playRecords: [] }

  try {
    const records = await getPlayRecordsByAllTime(forceUpdate)
    console.log(`[List Play Records] Received ${JSON.stringify(records).length} bytes from S3.`)
    result.playRecords = records.flat()
    return successResponse(result)
  } catch (err) {
    const error = err as Error
    console.log('[List Play Records] Error', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to list play records: ${error.message} ${error.stack ?? 'no-stack'}`)
  }
}
