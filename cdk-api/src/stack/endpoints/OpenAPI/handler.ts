import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda/trigger/api-gateway-proxy'
import { APIGatewayClient, GetExportCommand } from '@aws-sdk/client-api-gateway'
import { lambdaResponse } from '../helpers/lambdaResponse'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let openapiSpec, error
  try {
    const client = new APIGatewayClient({
      region: 'eu-west-2'
    })
    const command = new GetExportCommand({
      restApiId: event.requestContext.apiId,
      stageName: event.requestContext.stage,
      exportType: 'oas30'
    })
    const commandResponse = await client.send(command)
    // GetExportCommandOutput: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/getexportcommandoutput.html
    const decodedBody = new TextDecoder().decode(commandResponse.body)
    openapiSpec = JSON.parse(decodedBody)
    console.log('Successfully generated Open API spec')
  } catch (ex) {
    error = (ex as Error).message
    console.log('Unable to generate Open API spec, error:', error)
  }

  const responseData = openapiSpec ?? { message: 'Unable to retrieve or decode OpenAPI Spec', openapiSpec, error, event }
  return lambdaResponse(200, JSON.stringify(responseData))
}
