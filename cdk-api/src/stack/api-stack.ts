import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import OpenAPIRestAPI from './openapi/openapi-rest-api'
import ApiModels from './models/api-models'
import StatusEndpoint from './endpoints/status'
import OpenAPISpecEndpoint from './endpoints/openapi'
import HelloWorldEndpoint from './endpoints/hello'

interface StackParameters { hostedZoneDomain: string }

export class ApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: cdk.StackProps, config: StackParameters) {
    super(scope, id, props)

    const boardgamesApi = new OpenAPIRestAPI(this, 'Board Games API', {
      Description: 'Board Games API - https://github.com/connected-web/boardgames-api/',
      SubDomain: 'boardgames-api',
      HostedZoneDomain: config.hostedZoneDomain
    })

    const appModels = new ApiModels(this, boardgamesApi.restApi)
    boardgamesApi
      .get('/status', new StatusEndpoint(this, appModels))
      .get('/openapi', new OpenAPISpecEndpoint(this, appModels))
      .get('/hello/{name}', new HelloWorldEndpoint(this, appModels))
      .report()
  }
}
