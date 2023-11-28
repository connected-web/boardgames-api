import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'

import { OpenAPIBasicModels, OpenAPIEnums, OpenAPIRouteMetadata } from '@connected-web/openapi-rest-api'
import { Resources } from '../../Resources'
import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import path from 'path'
import AppModels from '../../models/ApiModels'

export default class OpenAPISpecEndpoint extends OpenAPIRouteMetadata<Resources> {
  grantPermissions (scope: Construct, endpoint: NodejsFunction, resources: Resources): void {
    const apiInformationPolicy = new PolicyStatement({
      actions: ['apigateway:GET'],
      resources: ['arn:aws:apigateway:*::/restapis/*/stages/*/exports/*']
    })

    endpoint.addToRolePolicy(apiInformationPolicy)
  }

  get operationId (): string {
    return 'getOpenAPISpec'
  }

  get routeEntryPoint (): string {
    return path.join(__dirname, 'handler.ts')
  }

  get lambdaConfig (): NodejsFunctionProps {
    return {}
  }

  get methodResponses (): MethodResponse[] {
    return [{
      statusCode: String(OpenAPIEnums.httpStatusCodes.success),
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
      responseModels: {
        'application/json': AppModels.openApiSpec
      }
    }]
  }
}
