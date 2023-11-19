import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'

import OpenAPIFunction from '../openapi/openapi-function'

export default class StatusEndpoint extends OpenAPIFunction {
  constructor (scope: Construct, models: AppModels) {
    super('getStatus')
    const currentDateTime = process.env.USE_MOCK_TIME ?? new Date()
    this.lambda = this.createNodeJSLambda(scope, 'routes/status.ts', {
      environment: {
        STATUS_INFO: JSON.stringify({
          deploymentTime: currentDateTime
        })
      }
    })
    this.addMetaData(models)
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
        'application/json': models.StatusResponse
      }
    })
  }
}
