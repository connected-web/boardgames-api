import { Construct } from 'constructs'
import { JsonSchema, JsonSchemaType, JsonSchemaVersion, Model, RestApi } from 'aws-cdk-lib/aws-apigateway'
import OpenAPIBasicModels from '../openapi/openapi-basic-models'
import { Fn } from 'aws-cdk-lib'

export class ApiJsonSchemas {
  readonly restApi: RestApi

  constructor (restApi: RestApi) {
    this.restApi = restApi
  }

  get StatusResponse (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Status',
      type: JsonSchemaType.OBJECT,
      properties: {
        deploymentTime: {
          type: JsonSchemaType.STRING,
          description: 'The UTC timestamp representing the last time the server was updated'
        }
      },
      required: ['deploymentTime']
    }
  }

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

  get PlayRecord (): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Play Record',
      type: JsonSchemaType.OBJECT,
      properties: {
        name: {
          type: JsonSchemaType.STRING
        },
        date: {
          type: JsonSchemaType.STRING
        },
        coOp: {
          type: JsonSchemaType.STRING
        },
        noOfPlayers: {
          type: JsonSchemaType.NUMBER
        },
        winner: {
          type: JsonSchemaType.STRING
        },
        key: {
          type: JsonSchemaType.STRING
        }
      },
      required: ['name', 'date', 'coOp', 'noOfPlayers']
    }
  }

  getModelRef (api: RestApi, model: Model): string {
    return Fn.join(
      '',
      ['https://apigateway.amazonaws.com/restapis/',
        api.restApiId,
        '/models/',
        model.modelId])
  }

  getPlayRecords (playRecordModel: Model): JsonSchema {
    return {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Play Records',
      type: JsonSchemaType.OBJECT,
      properties: {
        playRecords: {
          type: JsonSchemaType.ARRAY,
          items: {
            ref: this.getModelRef(this.restApi, playRecordModel)
          },
          description: 'An array of play records'
        }
      },
      required: ['playRecords']
    }
  }
}

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class AppModels extends OpenAPIBasicModels {
  StatusResponse: Model
  MessageResponse: Model
  PlayRecord: Model
  PlayRecords: Model

  constructor (scope: Construct, restApi: RestApi) {
    super(scope, restApi)

    const schemas = new ApiJsonSchemas(restApi)

    this.StatusResponse = new Model(scope, 'StatusResponse', {
      restApi,
      contentType: 'application/json',
      modelName: 'StatusResponseModel',
      schema: schemas.StatusResponse
    })

    this.MessageResponse = new Model(scope, 'MessageResponse', {
      restApi,
      contentType: 'application/json',
      modelName: 'MessageResponseModel',
      schema: schemas.MessageResponse
    })

    this.PlayRecord = new Model(scope, 'PlayRecord', {
      restApi,
      contentType: 'application/json',
      modelName: 'PlayRecordModel',
      schema: schemas.PlayRecord
    })

    this.PlayRecords = new Model(scope, 'PlayRecords', {
      restApi,
      contentType: 'application/json',
      modelName: 'PlayRecordsModel',
      schema: schemas.getPlayRecords(this.PlayRecord)
    })
  }
}
