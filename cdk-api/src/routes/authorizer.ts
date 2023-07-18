import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import axios, { AxiosInstance } from 'axios'

export async function handler (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
  const authHeader = event?.headers?.authorization ?? 'not-set'
  console.log('Authorizing using Bearer Token')
  return await getPolicyFromAuthHeader(authHeader)
}

async function getPolicyFromAuthHeader (authHeader: string): Promise<APIGatewayAuthorizerResult> {
  const [descriptor, token] = authHeader.trim().split(/\s+/)
  if (descriptor.toLowerCase() !== 'bearer') {
    console.log('Unexpected descriptor:', { descriptor })
    return buildPolicy('Deny', 'unknown', { })
  }
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: 'eu-west-2_rt9QhO9KA',
      tokenUse: 'access',
      clientId: '2fomt3amj0luqe3o5ce8ou76m8'
    })
    const payload = await verifier.verify(token)
    console.log('Authorization token is valid. Payload:', { payload })

    const oauthUrl: string = 'https://connected-web.auth.eu-west-2.amazoncognito.com'
    const oauthClient: AxiosInstance = axios.create({ baseURL: oauthUrl })
    const user = await oauthClient.get('/oauth2/userInfo', {
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    console.log('User Info:', { userLookup: user.data })
    return buildPolicy('Allow', user.data.email, { token })
  } catch (err) {
    console.log('Authorization token not valid!', err)
    return buildPolicy('Deny', 'unknown', { })
  }
}

function buildPolicy (allowOrDeny: 'Allow' | 'Deny', principalId: string, context: { [key: string]: string }): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Effect: allowOrDeny,
        Action: 'execute-api:invoke',
        Resource: 'arn:aws:execute-api:*:*:*'
      }]
    },
    context
  }
}
