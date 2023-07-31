import { APIGatewayProxyEvent } from 'aws-lambda'
import { ResponseObject, errorResponse } from './responses'
import HTTP_CODES from './httpCodes'

const ADMIN_SCOPES = [
  'BoardGamesBrowserAdmins',
  'app-to-app-connected-web-dev/Github',
  'app-to-app-connected-web-prod/Github'
]

export function partOfAdminGroup (userGroups: string[]): boolean {
  return containsMatchingScope(userGroups, ADMIN_SCOPES)
}

export function containsMatchingScope (userGroups: string[], scopes: string[]): boolean {
  return userGroups.filter(userGroup => scopes.includes(userGroup)).length > 0
}

export function verifyAdminScope (event: APIGatewayProxyEvent): ResponseObject | undefined {
  const userGroups = (event.requestContext.authorizer?.groups ?? '').split(',').map((id: string) => id.trim())
  const adminUser = partOfAdminGroup(userGroups)
  if (adminUser) {
    console.log('User part of authorized group', { userGroups })
  } else {
    console.log('User not part of an authorized group:', { userGroups })
    return errorResponse(HTTP_CODES.clientForbidden, 'User is authenticated, but not in an authorized user group for this action')
  }
}
