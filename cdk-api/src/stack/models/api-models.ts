import { Construct } from 'constructs'
import { JsonSchema, JsonSchemaType, JsonSchemaVersion, Model, RestApi } from 'aws-cdk-lib/aws-apigateway'
import OpenAPIStubModels from '../openapi/openapi-stub-models'

const appMessageJsonSchema: JsonSchema = {
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

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class AppModels extends OpenAPIStubModels {
  appMessageModel: Model

  constructor (scope: Construct, restApi: RestApi) {
    super(scope, restApi)
    this.appMessageModel = new Model(scope, 'appVersion', {
      restApi,
      contentType: 'application/json',
      modelName: 'AppMessageModel',
      schema: appMessageJsonSchema
    })
  }
}
