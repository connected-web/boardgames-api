import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { StackParameters } from './ApiStack'

export class Resources {
  scope: Construct
  stack: cdk.Stack

  playRecordsBucket: s3.Bucket

  constructor (scope: Construct, stack: cdk.Stack, config: StackParameters) {
    this.scope = scope
    this.stack = stack

    this.playRecordsBucket = new s3.Bucket(stack, 'PlayRecordsBucket', {
      bucketName: config.playRecordsBucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
  }
}
