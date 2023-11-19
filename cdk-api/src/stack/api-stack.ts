import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'

import { Construct } from 'constructs'
import { OpenAPIRestAPI, OpenAPIVerifiers, OpenAPIBasicModels } from '@connected-web/openapi-rest-api'
import ApiModels from './models/ApiModels'
import StatusEndpoint from './endpoints/Status/metadata'
import OpenAPISpecEndpoint from './endpoints/OpenAPI/metadata'
import HelloWorldEndpoint from './endpoints/Hello/metadata'

import ListPlayRecordsEndpoint from './endpoints/ListPlayrecords/metadata'
import CreatePlayRecordEndpoint from './endpoints/CreatePlayrecord/metadata'
import DeletePlayRecordEndpoint from './endpoints/DeletePlayrecord/metadata'
import ListPlayRecordsByDateEndpoint from './endpoints/ListPlayrecordsByDate/metadata'
import { Resources } from './Resources'

export interface IdentityConfig {
  verifiers: Verifier[]
}

export interface StackParameters { hostedZoneDomain: string, playRecordsBucketName: string, identity: IdentityConfig }

export class ApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: cdk.StackProps, config: StackParameters) {
    super(scope, id, props)

    const resources = new Resources(scope, this, config)

    const boardgamesApi = new OpenAPIRestAPI<Resources>(this, 'Board Games API', {
      Description: 'Board Games API - https://github.com/connected-web/boardgames-api/',
      SubDomain: 'boardgames-api',
      HostedZoneDomain: config.hostedZoneDomain,
      Verifiers: config?.identity.verifiers ?? []
    }, resources)

    OpenAPIBasicModels.setup(this, boardgamesApi.restApi)
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
