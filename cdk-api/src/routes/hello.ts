import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda/trigger/api-gateway-proxy'
import { lambdaResponse } from './helpers/lambdaResponse'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const messageTemplate = process.env.MESSAGE_TEMPLATE ?? 'Hi {{ name }}, have a {{ weather }} day~'
  const exampleEnv = JSON.parse(process.env.EXAMPLE_ENV ?? '{}')
  const weather = exampleEnv?.weather as string
  const name = decodeURIComponent(event?.pathParameters?.name as string)
  const message = messageTemplate
    .replace('{{ name }}', name)
    .replace('{{ weather }}', weather)
  const responseBody = JSON.stringify({ message })
  return lambdaResponse(200, responseBody)
}
