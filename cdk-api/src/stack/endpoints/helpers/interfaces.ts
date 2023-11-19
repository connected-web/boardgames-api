import deleteObject, { DeleteObjectParams } from './aws/deleteObject'
import getObject, { GetObjectParams } from './aws/getObject'
import putObject, { PutObjectParams } from './aws/putObject'
import listObjects, { ListObjectParams } from './aws/listObjects'

import { DeleteObjectCommandOutput, ListObjectsV2CommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3'

export interface Interfaces {
  console: Console
  deleteObject: (params: DeleteObjectParams) => Promise<DeleteObjectCommandOutput>
  getObject: (params: GetObjectParams) => Promise<string>
  putObject: (params: PutObjectParams) => Promise<PutObjectCommandOutput>
  listObjects: (params: ListObjectParams) => Promise<ListObjectsV2CommandOutput>
  now: () => Date
  getBucketName: () => string
}

export interface PartialInterfaces {
  console?: Console
  deleteObject?: (params: DeleteObjectParams) => Promise<DeleteObjectCommandOutput>
  getObject?: (params: GetObjectParams) => Promise<string>
  putObject?: (params: PutObjectParams) => Promise<PutObjectCommandOutput>
  listObjects?: (params: ListObjectParams) => Promise<ListObjectsV2CommandOutput>
  now?: () => Date
  getBucketName?: () => string
}

const interfaces: Interfaces = {
  console,
  deleteObject,
  getObject,
  putObject,
  listObjects,
  now: () => new Date(),
  getBucketName () {
    return process.env.DATA_BUCKET_NAME ?? 'process-env-data-bucket-name-not-set'
  }
}

const originalInterfaces: Interfaces = Object.assign({}, interfaces)

function modifyInterfaces (overrides: PartialInterfaces): Interfaces {
  Object.assign(interfaces, overrides)
  return originalInterfaces
}

function resetInterfaces (): void {
  Object.assign(interfaces, originalInterfaces)
}

function get (): Interfaces {
  return interfaces
}

export default {
  modifyInterfaces,
  resetInterfaces,
  get
}
