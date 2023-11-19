import { Construct } from 'constructs'
import AppModels from '../../models/ApiModels'

import OpenAPIFunction from '../openapi/openapi-function'

const defaultTemplate = 'Hi {{ name }}, have a {{ weather }} day~ ☀️⛅☁️🌧️⛈️🌩️!'

export default class HelloWorldEndpoint extends OpenAPIFunction {
  constructor (scope: Construct, models: AppModels) {
    super('helloWorld')
    this.lambda = this.createNodeJSLambda(scope, 'routes/hello.ts', {
      environment: {
        MESSAGE_TEMPLATE: defaultTemplate,
        EXAMPLE_ENV: JSON.stringify({
          weather: 'sunny'
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
        'application/json': models.MessageResponse
      }
    })
  }
}
