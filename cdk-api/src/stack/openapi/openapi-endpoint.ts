import { HttpMethod } from 'aws-cdk-lib/aws-lambda'

/**
 * OpenAPIEndpoint
 *
 * A composite object for associating a http method (GET, PUT, POST, DELETE), path (/pets/{id}), to a generic handler, e.g. OpenAPIFunction, Lambda
 */
export default class OpenAPIEndpoint<T> {
  private readonly _httpMethod: HttpMethod
  private readonly _path: string
  private readonly _value: T

  constructor (httpMethod: HttpMethod, path: string, value: T) {
    this._httpMethod = httpMethod
    this._path = path
    this._value = value
  }

  get httpMethod (): HttpMethod {
    return this._httpMethod
  }

  get path (): string {
    return this._path
  }

  get value (): T {
    return this._value
  }
}
