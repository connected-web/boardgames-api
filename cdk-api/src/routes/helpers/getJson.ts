import interfaces from './interfaces'

export interface JsonObject {
  [key: string]: any
}

export type JsonArray = any[]

export default async function getJsonObject (key: string): Promise<JsonObject | JsonArray> {
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
