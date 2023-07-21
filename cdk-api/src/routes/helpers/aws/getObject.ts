import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export interface GetObjectParams {
  Bucket: string
  Key: string
}

export default async function getObject (params: GetObjectParams): Promise<string> {
  const goc = new GetObjectCommand(params)

  const response = await s3Client.send(goc)
  if (response?.Body !== undefined) {
    return await response.Body.transformToString('utf8')
  }
  return '{ "error": "no-body" }'
}
