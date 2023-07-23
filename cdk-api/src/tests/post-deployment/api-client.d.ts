import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig
} from 'openapi-client-axios'

declare namespace Components {
  namespace Schemas {
    /**
         * Basic Object
         * A basic JSON object with key value pairs
         */
    export interface BasicObjectModel {
      [name: string]: any
    }
    /**
         * Message
         */
    export interface MessageResponseModel {
      /**
             * The message returned by the server
             */
      message: string
    }
    /**
         * Play Record
         */
    export interface PlayRecordModel {
      date: string
      coOp: string
      winner?: string
      name: string
      noOfPlayers: number
      key?: string
    }
    /**
         * Play Records
         */
    export interface PlayRecordsModel {
      /**
             * An array of play records
             */
      playRecords: /* Play Record */ PlayRecordModel[]
    }
    /**
         * Status
         */
    export interface StatusResponseModel {
      /**
             * The UTC timestamp representing the last time the server was updated
             */
      deploymentTime: string
    }
  }
}
declare namespace Paths {
  namespace CreatePlayRecord {
    namespace Responses {
      export type $200 = /**
             * Basic Object
             * A basic JSON object with key value pairs
             */
            Components.Schemas.BasicObjectModel
    }
  }
  namespace DeletePlayRecord {
    namespace Responses {
      export type $200 = /**
             * Basic Object
             * A basic JSON object with key value pairs
             */
            Components.Schemas.BasicObjectModel
    }
  }
  namespace GetOpenAPISpec {
    namespace Responses {
      export type $200 = /**
             * Basic Object
             * A basic JSON object with key value pairs
             */
            Components.Schemas.BasicObjectModel
    }
  }
  namespace GetStatus {
    namespace Responses {
      export type $200 = /* Status */ Components.Schemas.StatusResponseModel
    }
  }
  namespace Hello$Name {
    namespace Options {
      namespace Parameters {
        export type Name = string
      }
      export interface PathParameters {
        name: Parameters.Name
      }
    }
  }
  namespace HelloWorld {
    namespace Parameters {
      export type Name = string
    }
    export interface PathParameters {
      name: Parameters.Name
    }
    namespace Responses {
      export type $200 = /* Message */ Components.Schemas.MessageResponseModel
    }
  }
  namespace ListPlayRecords {
    namespace Responses {
      export type $200 = /* Play Records */ Components.Schemas.PlayRecordsModel
    }
  }
  namespace ListPlayRecordsByDate {
    namespace Parameters {
      export type DateCode = string
    }
    export interface PathParameters {
      dateCode: Parameters.DateCode
    }
    namespace Responses {
      export type $200 = /* Play Records */ Components.Schemas.PlayRecordsModel
    }
  }
  namespace PlayrecordsList$DateCode {
    namespace Options {
      namespace Parameters {
        export type DateCode = string
      }
      export interface PathParameters {
        dateCode: Parameters.DateCode
      }
    }
  }
}

export interface OperationMethods {
  /**
   * getStatus
   */
  'getStatus': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetStatus.Responses.$200>
  /**
   * listPlayRecords
   */
  'listPlayRecords': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.ListPlayRecords.Responses.$200>
  /**
   * helloWorld
   */
  'helloWorld': (
    parameters?: Parameters<Paths.HelloWorld.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.HelloWorld.Responses.$200>
  /**
   * deletePlayRecord
   */
  'deletePlayRecord': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.DeletePlayRecord.Responses.$200>
  /**
   * listPlayRecordsByDate
   */
  'listPlayRecordsByDate': (
    parameters?: Parameters<Paths.ListPlayRecordsByDate.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.ListPlayRecordsByDate.Responses.$200>
  /**
   * getOpenAPISpec
   */
  'getOpenAPISpec': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
  /**
   * createPlayRecord
   */
  'createPlayRecord': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.CreatePlayRecord.Responses.$200>
}

export interface PathsDictionary {
  ['/status']: {
    /**
     * getStatus
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetStatus.Responses.$200>
  }
  ['/playrecords/list']: {
    /**
     * listPlayRecords
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.ListPlayRecords.Responses.$200>
  }
  ['/playrecords']: {
  }
  ['/hello/{name}']: {
    /**
     * helloWorld
     */
    'get': (
      parameters?: Parameters<Paths.HelloWorld.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.HelloWorld.Responses.$200>
  }
  ['/playrecords/delete']: {
    /**
     * deletePlayRecord
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.DeletePlayRecord.Responses.$200>
  }
  ['/playrecords/list/{dateCode}']: {
    /**
     * listPlayRecordsByDate
     */
    'get': (
      parameters?: Parameters<Paths.ListPlayRecordsByDate.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.ListPlayRecordsByDate.Responses.$200>
  }
  ['/openapi']: {
    /**
     * getOpenAPISpec
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
  }
  ['/playrecords/create']: {
    /**
     * createPlayRecord
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.CreatePlayRecord.Responses.$200>
  }
  ['/']: {
  }
  ['/hello']: {
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
