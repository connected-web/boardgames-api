import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import OpenAPIRestAPI from './openapi/openapi-rest-api'
import ApiModels from './models/api-models'
import StatusEndpoint from './endpoints/status'
import OpenAPISpecEndpoint from './endpoints/openapi'
import HelloWorldEndpoint from './endpoints/hello'

interface StackParameters { hostedZoneDomain: string, authorizerArn: string }

export class App extends cdk.Stack {
  constructor (scope: Construct, id: string, props: cdk.StackProps, config: StackParameters) {
    super(scope, id, props)

    const boardgamesApi = new OpenAPIRestAPI(this, 'OpenAPI Template App API', {
      Description: 'OpenAPI Template App API - part of the OpenAPI Apps Platform',
      SubDomain: 'template-app',
      HostedZoneDomain: config.hostedZoneDomain,
      AuthorizerArn: config.authorizerArn
    })

    const appModels = new ApiModels(this, boardgamesApi.restApi)
    boardgamesApi
      .get('/status', new StatusEndpoint(this, appModels))
      .get('/openapi', new OpenAPISpecEndpoint(this, appModels))
      .get('/hello/{name}', new HelloWorldEndpoint(this, appModels))
      .report()
  }
}
