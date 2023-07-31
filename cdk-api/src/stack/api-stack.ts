import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'

import { Construct } from 'constructs'
import OpenAPIRestAPI, { Verifier } from './openapi/openapi-rest-api'
import ApiModels from './models/api-models'
import StatusEndpoint from './endpoints/status'
import OpenAPISpecEndpoint from './endpoints/openapi'
import HelloWorldEndpoint from './endpoints/hello'

import ListPlayRecordsEndpoint from './endpoints/listPlayrecords'
import CreatePlayRecordEndpoint from './endpoints/createPlayrecord'
import DeletePlayRecordEndpoint from './endpoints/deletePlayrecord'
import ListPlayRecordsByDateEndpoint from './endpoints/listPlayRecordsByDate'

export interface IdentityConfig {
  verifiers: Verifier[]
}

export interface StackParameters { hostedZoneDomain: string, playRecordsBucketName: string, identity: IdentityConfig }

export class ApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: cdk.StackProps, config: StackParameters) {
    super(scope, id, props)

    const boardgamesApi = new OpenAPIRestAPI(this, 'Board Games API', {
      Description: 'Board Games API - https://github.com/connected-web/boardgames-api/',
      SubDomain: 'boardgames-api',
      HostedZoneDomain: config.hostedZoneDomain,
      Verifiers: config?.identity.verifiers ?? []
    })

    // Create an S3 bucket
    const playRecordsBucket = new s3.Bucket(this, 'PlayRecordsBucket', {
      bucketName: config.playRecordsBucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY // You can choose the appropriate removal policy based on your use case
    })

    const appModels = new ApiModels(this, boardgamesApi.restApi)
    boardgamesApi
      .get('/status', new StatusEndpoint(this, appModels))
      .get('/openapi', new OpenAPISpecEndpoint(this, appModels))
      .get('/hello/{name}', new HelloWorldEndpoint(this, appModels))
      .get('/playrecords/list', new ListPlayRecordsEndpoint(this, appModels, config, playRecordsBucket))
      .get('/playrecords/list/{dateCode}', new ListPlayRecordsByDateEndpoint(this, appModels, config, playRecordsBucket))
      .post('/playrecords/create', new CreatePlayRecordEndpoint(this, appModels, config, playRecordsBucket))
      .delete('/playrecords/delete', new DeletePlayRecordEndpoint(this, appModels, config, playRecordsBucket))
      .report()
  }
}
