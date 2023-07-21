import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import interfaces from '../helpers/interfaces'
import HTTP_CODES from '../helpers/httpCodes'
import { successResponse, errorResponse } from '../helpers/responses'

interface JsonObject {
  [key: string]: any
}

async function getJsonObject (key: string): Promise<JsonObject> {
  const { getObject, getBucketName } = interfaces.get()
  let recordBody, recordData
  try {
    const bucket = getBucketName()
    recordBody = await getObject({
      Bucket: bucket,
      Key: key
    })
    recordData = JSON.parse(recordBody)
    recordData.key = key
  } catch (ex) {
    recordData = {
      key,
      error: (ex as Error).message,
      recordBody
    }
  }
  return recordData
}

interface ListPlayRecordsResponse {
  playRecords: JsonObject[]
}

export async function handler (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { console, listObjects, getBucketName } = interfaces.get()

  const result: ListPlayRecordsResponse = { playRecords: [] }
  const bucket = getBucketName()

  try {
    const recordSearch = await listObjects({
      Bucket: bucket,
      Prefix: ''
    })
    const recordList = recordSearch?.Contents ?? []
    const recordKeys = recordList
      .filter((item: any) => item.Key.includes('.json') === true && item.Key.includes('apiKeys') === false)
      .map((item: any) => item.Key)
    const recordGathering = recordKeys.map(getJsonObject)
    const records = await Promise.all(recordGathering)
    result.playRecords = records

    console.log(`[List Play Records] Received ${JSON.stringify(records).length} bytes from S3.`)
  } catch (err) {
    const error = err as Error
    console.log('[List Play Records] Error', error.message)
    return errorResponse(HTTP_CODES.serverError, `Unable to list play records from ${bucket}: ${error.message} ${error.stack ?? 'no-stack'}`)
  }

  return successResponse(result)
}
