import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import { JsonObject } from '../helpers/getJson'
import { getPlayRecordsByDateCode, matchDateCode } from '../helpers/playrecords/helpers'

interface ListPlayRecordsResponse {
  playRecords: JsonObject[]
}

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const dateCode = decodeURIComponent(event?.pathParameters?.dateCode as string)
  const forceUpdate = true // event.queryStringParameters?.forceUpdate === 'true'

  const dateCodeMatch = matchDateCode(dateCode)
  if (!dateCodeMatch.valid) {
    return errorResponse(HTTP_CODES.clientError, `Supplied date code (${dateCode}) was not in the expected format of YYYY or YYYY-DD`)
  }

  const result: ListPlayRecordsResponse = { playRecords: [] }

  try {
    const records = await getPlayRecordsByDateCode(dateCode, forceUpdate)
    console.log(`[List Play Records by Date Code] Filter: (${dateCode}) Received ${JSON.stringify(records).length} bytes from S3.`)
    result.playRecords = records
    return successResponse(result)
  } catch (err) {
    const error = err as Error
    console.log(`[List Play Records by Date Code] Filter: (${dateCode}), Error`, error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to list play records: ${error.message} ${error.stack ?? 'no-stack'}`)
  }
}
