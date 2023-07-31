import HTTP_CODES from './httpCodes'
import corsHeaders from './corsHeaders'

export interface ResponseObject {
  statusCode: number
  headers: any
  body: string
}

export function errorResponse (statusCode: number, message: string): ResponseObject {
  return {
    statusCode: statusCode ?? HTTP_CODES.serverError,
    headers: corsHeaders,
    body: JSON.stringify({
      message
    })
  }
}

export function successResponse (payload: any): ResponseObject {
  return {
    statusCode: HTTP_CODES.success,
    headers: corsHeaders,
    body: JSON.stringify(payload)
  }
}
