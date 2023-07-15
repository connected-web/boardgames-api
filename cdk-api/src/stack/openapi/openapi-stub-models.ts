import { IRestApi, JsonSchema, JsonSchemaType, JsonSchemaVersion, Model } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'

const stubObjectJsonSchema: JsonSchema = {
  schema: JsonSchemaVersion.DRAFT4,
  title: 'Object Stub',
  type: JsonSchemaType.OBJECT,
  properties: {
    message: {
      type: JsonSchemaType.STRING,
      description: 'This is a stub'
    }
  }
}
const stubArrayJsonSchema: JsonSchema = {
  schema: JsonSchemaVersion.DRAFT4,
  title: 'Array Stub',
  type: JsonSchemaType.ARRAY,
  items: {
    type: JsonSchemaType.OBJECT,
    properties: {
      message: {
        type: JsonSchemaType.STRING,
        description: 'This array item is a stub'
      }
    }
  }
}

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class OpenAPIStubModels {
  stubObjectModel: Model
  stubArrayModel: Model

  constructor (scope: Construct, restApi: IRestApi) {
    this.stubObjectModel = new Model(scope, 'stubObject', {
      restApi,
      contentType: 'application/json',
      modelName: 'StubObjectModel',
      schema: stubObjectJsonSchema
    })

    this.stubArrayModel = new Model(scope, 'stubArray', {
      restApi,
      contentType: 'application/json',
      modelName: 'StubArrayModel',
      schema: stubArrayJsonSchema
    })
  }
}
