import path from 'node:path'
import { Duration } from 'aws-cdk-lib'
import { IModel, MethodOptions, MethodResponse } from 'aws-cdk-lib/aws-apigateway'
import { Function, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

function uppercaseFirstLetter (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * OpenAPIFunction
 *
 * A composite object for an operationId, a Lambda function, its requestModels, and any methodResponses, for use with an OpenAPI compliant REST API.
 */
export default class OpenAPIFunction {
  private readonly _operationId: string
  private readonly _requestModels: { [param: string]: IModel }
  private readonly _methodResponses: MethodResponse[]
  private _lambda?: Function

  /**
   * OpenAPI Spec : operationId
   * The id MUST be unique among all operations described in the API.
   * The operationId value is case-sensitive.
   * Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
   * See: https://spec.openapis.org/oas/latest.html
   *
   * @param operationId unique string used to identify the operation
   */
  constructor (operationId: string) {
    this._operationId = operationId
    this._requestModels = {}
    this._methodResponses = []
  }

  set lambda (value) {
    this._lambda = value
  }

  get lambda (): NodejsFunction | undefined {
    return this._lambda
  }

  createNodeJSLambda (scope: Construct, routeEntryPoint: string, additionalProps?: NodejsFunctionProps): NodejsFunction {
    const { operationId: operationName } = this
    const defaultProps = {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../', routeEntryPoint),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk']
      }
    }

    const finalProps = Object.assign({}, defaultProps, additionalProps ?? {})
    return new NodejsFunction(scope, uppercaseFirstLetter(operationName), finalProps)
  }

  addMethodResponse (methodResponse: MethodResponse): OpenAPIFunction {
    this._methodResponses.push(methodResponse)
    return this
  }

  get methodResponses (): MethodResponse[] {
    return this._methodResponses
  }

  addRequestModel (responseModel: IModel, contentTypeKey: string = 'application/json'): OpenAPIFunction {
    this._requestModels[contentTypeKey] = responseModel
    return this
  }

  get requestModels (): { [param: string]: IModel } {
    return this._requestModels
  }

  get operationId (): string {
    return this._operationId
  }

  get methodOptions (): MethodOptions {
    const optionalRequestModel: { requestModels?: { [param: string]: IModel } } = {}
    if (Object.keys(this.requestModels).length > 0) {
      optionalRequestModel.requestModels = this.requestModels
    }
    return {
      operationName: this.operationId,
      methodResponses: this.methodResponses,
      ...optionalRequestModel
    }
  }
}
