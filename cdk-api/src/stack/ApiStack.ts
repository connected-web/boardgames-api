import * as cdk from 'aws-cdk-lib'

import { Construct } from 'constructs'
import { OpenAPIRestAPI, OpenAPIBasicModels } from '@connected-web/openapi-rest-api'

import StatusEndpoint from './endpoints/Status/metadata'
import OpenAPISpecEndpoint from './endpoints/OpenAPI/metadata'
import HelloWorldEndpoint from './endpoints/Hello/metadata'

import ListPlayRecordsEndpoint from './endpoints/ListPlayrecords/metadata'
import CreatePlayRecordEndpoint from './endpoints/CreatePlayrecord/metadata'
import DeletePlayRecordEndpoint from './endpoints/DeletePlayrecord/metadata'
import ListPlayRecordsByDateEndpoint from './endpoints/ListPlayrecordsByDate/metadata'
import ViewPlayRecordEndpoint from './endpoints/ViewPlayrecord/metadata'
import UpdatePlayRecordEndpoint from './endpoints/UpdatePlayrecord/metadata'

import { Resources } from './Resources'
import { Verifier } from '@connected-web/openapi-rest-api/library/dist/src/openapi/RestAPI'

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

    boardgamesApi
      .addEndpoints({
        'GET /status': new StatusEndpoint(),
        'GET /openapi': new OpenAPISpecEndpoint(),
        'GET /hello/{name}': new HelloWorldEndpoint(),
        'POST /playrecords/create': new CreatePlayRecordEndpoint(resources),
        'GET /playrecords/view/:playRecordKey': new ViewPlayRecordEndpoint(resources),
        'PUT /playrecords/update': new UpdatePlayRecordEndpoint(resources),
        'GET /playrecords/list': new ListPlayRecordsEndpoint(resources),
        'GET /playrecords/list/{dateCode}': new ListPlayRecordsByDateEndpoint(resources),
        'DELETE /playrecords/delete': new DeletePlayRecordEndpoint(resources)
      })
      .report()
  }
}
