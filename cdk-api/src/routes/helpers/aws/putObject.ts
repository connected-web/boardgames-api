import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export interface PutObjectParams {
  Bucket: string
  Key: string
  Body: string
  ContentType?: string
}

export default async function putObject (params: PutObjectParams): Promise<PutObjectCommandOutput> {
  const poc = new PutObjectCommand(params)
  return await s3Client.send(poc)
}
