import { APIGatewayProxyResult } from 'aws-lambda'

export const lambdaResponse = (statusCode: number, body: string = ''): APIGatewayProxyResult => {
  return {
    statusCode,
    body,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, content-type',
      'Access-Control-Allow-Methods': '*'
    }
  }
}
