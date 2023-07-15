#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { App } from './src/stack/api-stack'

const {
  APPS_API_STACKNAME,
  APPS_API_HOSTED_ZONE_DOMAIN,
  APPS_API_AUTHORIZER_ARN,
  CDK_DEFAULT_ACCOUNT,
  CDK_DEFAULT_REGION
} = process.env

const app = new cdk.App()
const stackName = APPS_API_STACKNAME ?? 'MyTemplateApp'
const stackTemplate = new App(app, stackName, {
  env: {
    account: CDK_DEFAULT_ACCOUNT ?? '123456789012',
    region: CDK_DEFAULT_REGION ?? 'eu-west-2'
  }
},
{
  hostedZoneDomain: APPS_API_HOSTED_ZONE_DOMAIN as string,
  authorizerArn: APPS_API_AUTHORIZER_ARN as string
})

console.log('Created stack', stackTemplate.stackName)
