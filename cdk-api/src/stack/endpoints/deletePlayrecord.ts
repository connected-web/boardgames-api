import { Construct } from 'constructs'
import { StackParameters } from '../api-stack'
import AppModels from '../models/api-models'
import OpenAPIFunction from '../openapi/openapi-function'
import * as s3 from 'aws-cdk-lib/aws-s3'

export default class DeletePlayrecordEndpoint extends OpenAPIFunction {
  constructor (scope: Construct, models: AppModels, config: StackParameters, bucket: s3.Bucket) {
    super('deletePlayRecord')
    this.lambda = this.createNodeJSLambda(scope, 'routes/playrecords/delete.ts', {
      environment: {
        DATA_BUCKET_NAME: config.playRecordsBucketName
      }
    })
    bucket.grantReadWrite(this.lambda)
    this.addMetaData(models)
  }

  addMetaData (models: AppModels): void {
    this.addMethodResponse({
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
      responseModels: {
        'application/json': models.BasicObjectModel
      }
    })
  }
}
