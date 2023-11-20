import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'

import path from 'path'
import { Resources } from '../../Resources'
import { OpenAPIRouteMetadata } from '@connected-web/openapi-rest-api'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'

const defaultTemplate = 'Hi {{ name }}, have a {{ weather }} day~ ☀️⛅☁️🌧️⛈️🌩️!'

export default class HelloWorldEndpoint extends OpenAPIRouteMetadata<Resources> {
  grantPermissions (scope: Construct, endpoint: NodejsFunction, resources: Resources): void {
    resources.playRecordsBucket.grantReadWrite(endpoint)
  }

  get operationId (): string {
    return 'helloWorld'
  }

  get routeEntryPoint (): string {
    return path.join(__dirname, 'handler.ts')
  }

  get lambdaConfig (): NodejsFunctionProps {
    return {
      environment: {
        MESSAGE_TEMPLATE: defaultTemplate,
        EXAMPLE_ENV: JSON.stringify({
          weather: 'sunny'
        })
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
        'application/json': AppModels.messageResponse
      }
    }]
  }
}
