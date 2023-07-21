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
    export interface AppMessageModel {
      /**
             * The message returned by the server
             */
      message: string
    }
    /**
         * Object Stub
         */
    export interface StubObjectModel {
      /**
             * This is a stub
             */
      message?: string
    }
  }
}
declare namespace Paths {
  namespace GetOpenAPISpec {
    namespace Responses {
      export type $200 = /* Object Stub */ Components.Schemas.StubObjectModel
    }
  }
  namespace GetStatus {
    namespace Responses {
      export type $200 = /* Object Stub */ Components.Schemas.StubObjectModel
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
      export type $200 = /* Message */ Components.Schemas.AppMessageModel
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
   * helloWorld
   */
  'helloWorld': (
    parameters?: Parameters<Paths.HelloWorld.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.HelloWorld.Responses.$200>
  /**
   * getOpenAPISpec
   */
  'getOpenAPISpec': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
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
  ['/hello']: {
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
