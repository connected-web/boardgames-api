import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { ApiStack } from '../../stack/api-stack'

import fs from 'node:fs'

const getTemplate = (): Template => {
  const app = new cdk.App()
  const stack = new ApiStack(app, 'MyTestStack', {
    env: {
      account: '1234567890',
      region: 'eu-west-2'
    }
  },
  {
    hostedZoneDomain: 'dummy.domain.name',
    playRecordsBucketName: 'unit-test-bucket-name-for-playrecords',
    identity: {
      verifiers: []
    }
  })
  const template = Template.fromStack(stack)
  fs.writeFileSync('src/tests/template.json', JSON.stringify(template, null, 2))
  return template
}

describe('REST API', () => {
  let template: Template

  beforeAll(() => {
    template = getTemplate()
  })

  it('Creates an AWS ApiGateway RestApi with the correct title and description', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Description: 'Board Games API - https://github.com/connected-web/boardgames-api/',
      Name: 'Board Games API'
    })
  })

  it('Creates a AWS ApiGateway Method with the operationId - getStatus', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      OperationName: 'getStatus'
    })
  })

  it('Creates a AWS ApiGateway Method with the operationId - getOpenAPISpec', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      OperationName: 'getOpenAPISpec'
    })
  })

  it('Creates a AWS ApiGateway Method with the operationId - helloWorld', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      OperationName: 'helloWorld'
    })
  })
})
