import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'

import { Construct } from 'constructs'
import OpenAPIRestAPI from './openapi/openapi-rest-api'
import ApiModels from './models/api-models'
import StatusEndpoint from './endpoints/status'
import OpenAPISpecEndpoint from './endpoints/openapi'
import HelloWorldEndpoint from './endpoints/hello'

import ListPlayrecordsEndpoint from './endpoints/listPlayrecords'
import CreatePlayrecordEndpoint from './endpoints/createPlayrecord'
import DeletePlayrecordEndpoint from './endpoints/deletePlayrecord'

export interface StackParameters { hostedZoneDomain: string, playRecordsBucketName: string }

export class ApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: cdk.StackProps, config: StackParameters) {
    super(scope, id, props)

    const boardgamesApi = new OpenAPIRestAPI(this, 'Board Games API', {
      Description: 'Board Games API - https://github.com/connected-web/boardgames-api/',
      SubDomain: 'boardgames-api',
      HostedZoneDomain: config.hostedZoneDomain
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
      .get('/playrecords/list', new ListPlayrecordsEndpoint(this, appModels, config, playRecordsBucket))
      .get('/playrecords/create', new CreatePlayrecordEndpoint(this, appModels, config, playRecordsBucket))
      .get('/playrecords/delete', new DeletePlayrecordEndpoint(this, appModels, config, playRecordsBucket))
      .report()
  }
}
