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
         * Message
         */
    export interface MessageModel {
      /**
             * The message returned by the server
             */
      message: string
    }
    /**
         * OpenAPI Spec
         */
    export interface OpenAPISpecModel {
      /**
             * The OpenAPI components
             */
      components: {
        [key: string]: any
      }
      /**
             * The OpenAPI version
             */
      openapi: string
      /**
             * The OpenAPI paths
             */
      paths: {
        [key: string]: any
      }
      /**
             * The OpenAPI info
             */
      info: {
        [key: string]: any
      }
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
    export interface StatusModel {
      /**
             * The UTC timestamp representing the last time the server was updated
             */
      deploymentTime: string
    }
  }
}
declare namespace Paths {
  namespace DeletePlayrecordsDelete {
    namespace Responses {
      export type $200 = /* Message */ Components.Schemas.MessageModel
    }
  }
  namespace GetOpenAPISpec {
    namespace Responses {
      export type $200 = /* OpenAPI Spec */ Components.Schemas.OpenAPISpecModel
    }
  }
  namespace GetPlayrecordsList {
    namespace Responses {
      export type $200 = /* Play Records */ Components.Schemas.PlayRecordsModel
    }
  }
  namespace GetPlayrecordsListDateCode {
    namespace Parameters {
      export type DateCode = string
      export type ForceUpdate = string
    }
    export interface PathParameters {
      dateCode: Parameters.DateCode
    }
    export interface QueryParameters {
      forceUpdate?: Parameters.ForceUpdate
    }
    namespace Responses {
      export type $200 = /* Play Records */ Components.Schemas.PlayRecordsModel
    }
  }
  namespace GetPlayrecordsViewPlayRecordKey {
    namespace Parameters {
      export type PlayRecordKey = string
    }
    export interface PathParameters {
      playRecordKey: Parameters.PlayRecordKey
    }
    namespace Responses {
      export type $200 = /* Message */ Components.Schemas.MessageModel
    }
  }
  namespace GetStatus {
    namespace Responses {
      export type $200 = /* Status */ Components.Schemas.StatusModel
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
      export type $200 = /* Message */ Components.Schemas.MessageModel
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
  namespace PlayrecordsView$PlayRecordKey {
    namespace Options {
      namespace Parameters {
        export type PlayRecordKey = string
      }
      export interface PathParameters {
        playRecordKey: Parameters.PlayRecordKey
      }
    }
  }
  namespace PostPlayrecordsCreate {
    export type RequestBody = /* Play Record */ Components.Schemas.PlayRecordModel
    namespace Responses {
      export type $200 = /* Message */ Components.Schemas.MessageModel
    }
  }
  namespace PutPlayrecordsUpdate {
    export type RequestBody = /* Play Record */ Components.Schemas.PlayRecordModel
    namespace Responses {
      export type $200 = /* Message */ Components.Schemas.MessageModel
    }
  }
}

export interface OperationMethods {
  /**
   * getPlayrecordsList
   */
  'getPlayrecordsList': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetPlayrecordsList.Responses.$200>
  /**
   * deletePlayrecordsDelete
   */
  'deletePlayrecordsDelete': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.DeletePlayrecordsDelete.Responses.$200>
  /**
   * getPlayrecordsViewPlayRecordKey
   */
  'getPlayrecordsViewPlayRecordKey': (
    parameters?: Parameters<Paths.GetPlayrecordsViewPlayRecordKey.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetPlayrecordsViewPlayRecordKey.Responses.$200>
  /**
   * getOpenAPISpec
   */
  'getOpenAPISpec': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
  /**
   * getStatus
   */
  'getStatus': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetStatus.Responses.$200>
  /**
   * putPlayrecordsUpdate
   */
  'putPlayrecordsUpdate': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PutPlayrecordsUpdate.RequestBody,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.PutPlayrecordsUpdate.Responses.$200>
  /**
   * helloWorld
   */
  'helloWorld': (
    parameters?: Parameters<Paths.HelloWorld.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.HelloWorld.Responses.$200>
  /**
   * getPlayrecordsListDateCode
   */
  'getPlayrecordsListDateCode': (
    parameters?: Parameters<Paths.GetPlayrecordsListDateCode.PathParameters & Paths.GetPlayrecordsListDateCode.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetPlayrecordsListDateCode.Responses.$200>
  /**
   * postPlayrecordsCreate
   */
  'postPlayrecordsCreate': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostPlayrecordsCreate.RequestBody,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.PostPlayrecordsCreate.Responses.$200>
}

export interface PathsDictionary {
  ['/playrecords/list']: {
    /**
     * getPlayrecordsList
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetPlayrecordsList.Responses.$200>
  }
  ['/playrecords/view']: {
  }
  ['/playrecords/delete']: {
    /**
     * deletePlayrecordsDelete
     */
    'delete': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.DeletePlayrecordsDelete.Responses.$200>
  }
  ['/playrecords/view/{playRecordKey}']: {
    /**
     * getPlayrecordsViewPlayRecordKey
     */
    'get': (
      parameters?: Parameters<Paths.GetPlayrecordsViewPlayRecordKey.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetPlayrecordsViewPlayRecordKey.Responses.$200>
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
  ['/']: {
  }
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
  ['/playrecords/update']: {
    /**
     * putPlayrecordsUpdate
     */
    'put': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PutPlayrecordsUpdate.RequestBody,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.PutPlayrecordsUpdate.Responses.$200>
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
  ['/playrecords/list/{dateCode}']: {
    /**
     * getPlayrecordsListDateCode
     */
    'get': (
      parameters?: Parameters<Paths.GetPlayrecordsListDateCode.PathParameters & Paths.GetPlayrecordsListDateCode.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetPlayrecordsListDateCode.Responses.$200>
  }
  ['/playrecords/create']: {
    /**
     * postPlayrecordsCreate
     */
    'post': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostPlayrecordsCreate.RequestBody,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.PostPlayrecordsCreate.Responses.$200>
  }
  ['/hello']: {
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
