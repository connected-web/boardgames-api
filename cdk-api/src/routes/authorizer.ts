import { APIGatewayAuthorizerResult, APIGatewayAuthorizerResultContext, APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import axios, { AxiosInstance } from 'axios'

export interface AuthorizerContext extends APIGatewayAuthorizerResultContext {
  token?: string
  groups?: string
  payload?: string
}

export interface Verifier {
  name: string
  userPoolId: string // "eu-west-2_VBRbzaly6",
  tokenUse: 'id' | 'access' // "access",
  clientId: string // "5rgdg0eeeeu043fbfvl12ehrmg",
  oauthUrl: string // "https://connected-web-dev.auth.eu-west-2.amazoncognito.com"
}

const { AUTH_VERIFIERS_JSON } = process.env
const verifiers = JSON.parse((AUTH_VERIFIERS_JSON ?? '[]')) as Verifier[]

export async function handler (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
  const authHeader = event?.headers?.authorization ?? 'not-set'
  console.log('Authorizing using Bearer Token')
  return await getPolicyFromAuthHeader(authHeader, verifiers)
}

async function getPolicyFromAuthHeader (authHeader: string, verifiers: Verifier[]): Promise<APIGatewayAuthorizerResult> {
  const [descriptor, token] = authHeader.trim().split(/\s+/)
  if (descriptor.toLowerCase() !== 'bearer') {
    console.log('Unexpected descriptor:', { descriptor })
    return buildPolicy('Deny', 'unknown', { })
  }

  const authChecks = verifiers.map(async (verifierConfig) => {
    try {
      const verifier = CognitoJwtVerifier.create({
        userPoolId: verifierConfig.userPoolId, // 'eu-west-2_rt9QhO9KA',
        tokenUse: verifierConfig.tokenUse, // 'access',
        clientId: verifierConfig.clientId // '2fomt3amj0luqe3o5ce8ou76m8'
      })
      const payload = await verifier.verify(token)
      console.log('Authorization token is valid. Payload:', { payload })

      if (payload.username !== undefined) {
        const oauthUrl: string = verifierConfig.oauthUrl // 'https://connected-web.auth.eu-west-2.amazoncognito.com'
        const oauthClient: AxiosInstance = axios.create({ baseURL: oauthUrl })
        const user = await oauthClient.get('/oauth2/userInfo', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })
        const userGroups = (payload['cognito:groups'] ?? []).join(', ')
        console.log('User Info:', { userLookup: user.data, userGroups })
        return buildPolicy('Allow', user.data.email, { token, payload: JSON.stringify(payload), groups: userGroups })
      } else {
        const appGroups = (payload.scope as string ?? '').split(' ').join(', ')
        console.log('App Info:', { appGroups })
        return buildPolicy('Allow', payload.scope as string, { token, payload: JSON.stringify(payload), groups: appGroups })
      }
    } catch (err) {
      console.log('Authorization token not valid!', err)
      return buildPolicy('Deny', 'unknown', {})
    }
  }, [])

  const policies = await Promise.all(authChecks)
  const validPolicy = policies.find(policy => policy.policyDocument.Statement[0].Effect === 'Allow')
  if (validPolicy !== undefined) {
    return validPolicy
  }
  return policies[0] ?? buildPolicy('Deny', 'no-verifiers-configured', { authorizerError: 'No verifiers configured' })
}

function buildPolicy (allowOrDeny: 'Allow' | 'Deny', principalId: string, context: AuthorizerContext): APIGatewayAuthorizerResult {
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
