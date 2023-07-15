import { Construct } from 'constructs'
import AppModels from '../models/api-models'

import OpenAPIFunction from '../openapi/openapi-function'

const defaultTemplate = 'No template set, using default: name: "{{ name }}", weather: "{{ weather }}"'

export default class HelloWorldEndpoint extends OpenAPIFunction {
  constructor (scope: Construct, models: AppModels) {
    super('helloWorld')
    this.lambda = this.createNodeJSLambda(scope, 'routes/hello.ts', {
      environment: {
        MESSAGE_TEMPLATE: process.env.MESSAGE_TEMPLATE ?? defaultTemplate,
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
        'application/json': models.appMessageModel
      }
    })
  }
}
