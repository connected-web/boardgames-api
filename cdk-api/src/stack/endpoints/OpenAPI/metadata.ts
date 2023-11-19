import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import AppModels from '../../models/ApiModels'

import OpenAPIFunction from '../openapi/openapi-function'

export default class OpenAPISpecEndpoint extends OpenAPIFunction {
  constructor (scope: Construct, models: AppModels) {
    super('getOpenAPISpec')
    this.lambda = this.createNodeJSLambda(scope, 'routes/openapi.ts', {})
    this.attachRoles(this.lambda)
    this.addMetaData(models)
  }

  attachRoles (lambda: NodejsFunction): void {
    const apiInformationPolicy = new PolicyStatement({
      actions: ['apigateway:GET'],
      resources: ['arn:aws:apigateway:*::/restapis/*/stages/*/exports/*']
    })

    lambda.addToRolePolicy(apiInformationPolicy)
  }

  addMetaData (models: AppModels): void {
    this.addMethodResponse({
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
      responseModels: {
        'application/json': models.BasicObjectModel
      }
    })
  }
}
