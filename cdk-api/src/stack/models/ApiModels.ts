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

  static get status (): IModel {
    return OpenAPIBasicModels.modelFactory?.create('Status', {
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

  static get message (): IModel {
    return OpenAPIBasicModels.modelFactory?.create('Message', {
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

  static get updatedPlayrecord (): IModel {
    return OpenAPIBasicModels.modelFactory?.create('UpdatedPlayrecord', {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'Updated Playrecord',
      type: JsonSchemaType.OBJECT,
      properties: {
        message: {
          type: JsonSchemaType.STRING,
          description: 'The message returned by the server'
        },
        year: {
          type: JsonSchemaType.STRING,
          description: 'The year of the play record'
        },
        month: {
          type: JsonSchemaType.STRING,
          description: 'The month of the play record'
        },
        filename: {
          type: JsonSchemaType.STRING,
          description: 'The filename of the play record'
        },
        keypath: {
          type: JsonSchemaType.STRING,
          description: 'The keypath of the play record; may have changed if year or month have changed'
        },
        payload: {
          type: JsonSchemaType.OBJECT,
          description: 'The payload of the play record'
        }
      },
      required: ['message', 'keypath']
    })
  }

  static get openApiSpec (): IModel {
    return OpenAPIBasicModels.modelFactory?.create('OpenAPISpec', {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'OpenAPI Spec',
      type: JsonSchemaType.OBJECT,
      properties: {
        openapi: {
          type: JsonSchemaType.STRING,
          description: 'The OpenAPI version'
        },
        info: {
          type: JsonSchemaType.OBJECT,
          description: 'The OpenAPI info'
        },
        paths: {
          type: JsonSchemaType.OBJECT,
          description: 'The OpenAPI paths'
        },
        components: {
          type: JsonSchemaType.OBJECT,
          description: 'The OpenAPI components'
        }
      },
      required: ['openapi', 'info', 'paths', 'components']
    })
  }

  static get playRecord (): IModel {
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

  static get playRecords (): IModel {
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

export interface PlayRecordType {
  name: string
  date: string
  coOp: string
  noOfPlayers: number
  winner: string
  key?: string
  history?: PlayRecordType[]
}
