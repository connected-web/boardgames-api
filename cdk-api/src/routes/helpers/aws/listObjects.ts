import { ListObjectsV2Command, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export interface ListObjectParams {
  Bucket: string
  Prefix: string
}

export default async function listObjects (params: ListObjectParams): Promise<ListObjectsV2CommandOutput> {
  const loc = new ListObjectsV2Command(params)
  return await s3Client.send(loc)
}
