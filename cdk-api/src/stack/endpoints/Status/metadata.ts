import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'

import path from 'path'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'
import { Resources } from '../../Resources'
import { OpenAPIRouteMetadata } from '@connected-web/openapi-rest-api'

export default class StatusEndpoint extends OpenAPIRouteMetadata<Resources> {
  grantPermissions (scope: Construct, endpoint: NodejsFunction, resources: Resources): void {
    resources.playRecordsBucket.grantReadWrite(endpoint)
  }

  get routeEntryPoint (): string {
    return path.join(__dirname, 'handler.ts')
  }

  get methodResponses (): MethodResponse[] {
    return [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
      responseModels: {
        'application/json': AppModels.status
      }
    }]
  }
}
