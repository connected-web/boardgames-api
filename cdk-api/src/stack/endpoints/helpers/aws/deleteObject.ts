import { DeleteObjectCommand, DeleteObjectCommandOutput } from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export interface DeleteObjectParams {
  Bucket: string
  Key: string
}

export default async function deleteObject (params: DeleteObjectParams): Promise<DeleteObjectCommandOutput> {
  const doc = new DeleteObjectCommand(params)
  return await s3Client.send(doc)
}
