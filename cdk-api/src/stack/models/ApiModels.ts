import { JsonSchemaType, JsonSchemaVersion, IModel, IRestApi } from 'aws-cdk-lib/aws-apigateway'
import { OpenAPIBasicModels } from '@connected-web/openapi-rest-api'
import { Fn } from 'aws-cdk-lib'

/**
 * OpenAPI Models are added directly to a RestAPI construct; and shared between endpoints
 */
export default class AppModels extends OpenAPIBasicModels {
  static getModelRef (api: IRestApi, model: IModel): string {
    return Fn.join(
      '',
      ['https://apigateway.amazonaws.com/restapis/',
        api.restApiId,
        '/models/',
        model.modelId])
  }

  static get statusResponse (): IModel {
    return OpenAPIBasicModels.modelFactory?.create('StatusResponse', {
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
    })
  }

  static get messageResponse(): IModel {
    return OpenAPIBasicModels.modelFactory?.create('MessageResponse', {
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
    })
  }

  static get playRecord(): IModel {
    return OpenAPIBasicModels.modelFactory?.create('PlayRecord', {
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
    })
  }

  static get playRecords(): IModel {
    return OpenAPIBasicModels.modelFactory?.create('PlayRecords', {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Play Records',
      type: JsonSchemaType.OBJECT,
      properties: {
        playRecords: {
          type: JsonSchemaType.ARRAY,
          items: {
            ref: this.getModelRef(OpenAPIBasicModels.modelFactory.restApi, this.playRecord)
          },
          description: 'An array of play records'
        }
      },
      required: ['playRecords']
    })
  }
}
