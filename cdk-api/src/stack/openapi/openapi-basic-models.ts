import { IRestApi, JsonSchema, JsonSchemaType, JsonSchemaVersion, Model } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'

export class OpenAPIBasicJsonSchemas {
  get BasicObject (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Basic Object',
      description: 'A basic JSON object with key value pairs',
      type: JsonSchemaType.OBJECT,
      properties: {},
      additionalProperties: true
    }
  }

  get BasicArray (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Basic Array of Objects',
      type: JsonSchemaType.ARRAY,
      items: {
        type: JsonSchemaType.OBJECT,
        properties: {},
        additionalProperties: true
      }
    }
  }

  get BasicStringArray (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Basic Array of Strings',
      type: JsonSchemaType.ARRAY,
      items: {
        type: JsonSchemaType.STRING
      }
    }
  }
}

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class OpenAPIBasicModels {
  BasicObjectModel: Model
  BasicArrayModel: Model
  BasicStringArrayModel: Model

  constructor (scope: Construct, restApi: IRestApi) {
    const schemas = new OpenAPIBasicJsonSchemas()

    this.BasicObjectModel = new Model(scope, 'BasicObject', {
      restApi,
      contentType: 'application/json',
      modelName: 'BasicObjectModel',
      schema: schemas.BasicObject
    })

    this.BasicArrayModel = new Model(scope, 'BasicArray', {
      restApi,
      contentType: 'application/json',
      modelName: 'BasicArrayModel',
      schema: schemas.BasicArray
    })

    this.BasicStringArrayModel = new Model(scope, 'BasicStringArray', {
      restApi,
      contentType: 'application/json',
      modelName: 'BasicStringArrayModel',
      schema: schemas.BasicStringArray
    })
  }
}
