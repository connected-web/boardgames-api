import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'

import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import path from 'path'
import { Resources } from '../../Resources'
import { OpenAPIRouteMetadata } from '@connected-web/openapi-rest-api'

export default class ListPlayRecordsByDateEndpoint extends OpenAPIRouteMetadata<Resources> {
  resources: Resources

  constructor (resources: Resources) {
    super()
    this.resources = resources
  }

  grantPermissions (scope: Construct, endpoint: NodejsFunction, resources: Resources): void {
    resources.playRecordsBucket.grantReadWrite(endpoint)
  }

  get routeEntryPoint (): string {
    return path.join(__dirname, 'handler.ts')
  }

  get lambdaConfig (): NodejsFunctionProps {
    return {
      environment: {
        DATA_BUCKET_NAME: this.resources.playRecordsBucket.bucketName
      }
    }
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
        'application/json': AppModels.playRecords
      }
    }]
  }

  get requestParameters (): Record<string, boolean> {
    return {
      'method.request.path.dateCode': true,
      'method.request.querystring.forceUpdate': false
    }
  }
}
