import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'
import getJsonObject, { JsonArray, JsonObject } from '../helpers/getJsonObject'

interface ListPlayRecordsResponse {
  playRecords: JsonObject[]
}

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, getBucketName, listObjects, putObject } = interfaces.get()

  const dateCode = decodeURIComponent(event?.pathParameters?.dateCode as string)
  const forceUpdate = event.queryStringParameters?.forceUpdate ?? false

  const result: ListPlayRecordsResponse = { playRecords: [] }
  const bucket = getBucketName()

  const dateCodeMatcher = /^(?:\d{4}(?:-\d{2})?)$/
  if (!dateCodeMatcher.test(dateCode)) {
    return errorResponse(HTTP_CODES.clientError, `Supplied date code (${dateCode}) was not in the expected format: ${dateCodeMatcher.toString()}`)
  }
  const groupedRecordKey = `grouped/${dateCode}_playrecords.json`

  if (forceUpdate === false) {
    let existingRecords: JsonArray
    try {
      existingRecords = (await getJsonObject(groupedRecordKey)) as JsonArray
      if (existingRecords.length > 0) {
        result.playRecords = (existingRecords) ?? []
        console.log(`[List Play Records by Date Code] Found ${existingRecords.length} play records cached in (${groupedRecordKey})`)
        return successResponse(result)
      }
    } catch (ex) {
      const error = ex as Error
      console.log(`[List Play Records by Date Code] No grouped records found for: (${groupedRecordKey}), Error: `, error.message)
    }
  }

  try {
    console.log(`[List Play Records by Date Code] Searching for matching records to cache: (${dateCode})`)
    const recordSearch = await listObjects({
      Bucket: bucket,
      Prefix: ''
    })
    const recordList = recordSearch?.Contents ?? []
    const recordKeys = recordList
      .filter((item: any) => item.Key.includes('.json') === true && item.Key.includes('apiKeys') === false && item.Key.includes(dateCode) === true && item.Key.includes('grouped'))
      .map((item: any) => item.Key)
    const recordGathering = recordKeys.map(getJsonObject)
    const records = await Promise.all(recordGathering)
    result.playRecords = records

    await putObject({
      Bucket: bucket,
      Key: groupedRecordKey,
      Body: JSON.stringify(records)
    })

    console.log(`[List Play Records by Date Code] Filter: (${dateCode}) Received ${JSON.stringify(records).length} bytes from S3.`)
  } catch (err) {
    const error = err as Error
    console.log(`[List Play Records by Date Code] Filter: (${dateCode}), Error`, error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to list play records from ${bucket}: ${error.message} ${error.stack ?? 'no-stack'}`)
  }

  return successResponse(result)
}
