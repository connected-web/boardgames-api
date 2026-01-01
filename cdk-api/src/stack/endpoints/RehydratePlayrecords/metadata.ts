import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'
import { OpenAPIRouteMetadata } from '@connected-web/openapi-rest-api'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'
import { Resources } from '../../Resources'
import path from 'path'

export default class RehydratePlayrecordsEndpoint extends OpenAPIRouteMetadata<Resources> {
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
        'application/json': AppModels.message
      }
    }]
  }
}
