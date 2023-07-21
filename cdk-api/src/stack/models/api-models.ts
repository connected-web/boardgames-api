import { Construct } from 'constructs'
import { JsonSchema, JsonSchemaType, JsonSchemaVersion, Model, RestApi } from 'aws-cdk-lib/aws-apigateway'
import OpenAPIBasicModels from '../openapi/openapi-basic-models'

export class ApiJsonSchemas {
  get MessageResponse (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Message',
      type: JsonSchemaType.OBJECT,
      properties: {
        message: {
          type: JsonSchemaType.STRING,
          description: 'The message returned by the server'
        }
      },
      required: ['message']
    }
  }
}

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class AppModels extends OpenAPIBasicModels {
  MessageResponse: Model

  constructor (scope: Construct, restApi: RestApi) {
    super(scope, restApi)

    const schemas = new ApiJsonSchemas()

    this.MessageResponse = new Model(scope, 'MessageResponse', {
      restApi,
      contentType: 'application/json',
      modelName: 'MessageResponseModel',
      schema: schemas.MessageResponse
    })
  }
}
