import { Construct } from 'constructs'
import { StackParameters } from '../../api-stack'
import AppModels from '../../models/ApiModels'
import { OpenAPIRouteMetadata, OpenAPIHelpers, OpenAPIEnums } from '@connected-web/openapi-rest-api'
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { MethodResponse } from 'aws-cdk-lib/aws-apigateway'

export default class CreatePlayrecordEndpoint extends OpenAPIRouteMetadata<Resources> {
  resources: Resources

  constructor (scope: Construct, models: AppModels, config: StackParameters, resources: Resources) {
    super()
    this.resources = resources
  }

  get lambdaConfig() : NodejsFunctionProps {
    return {
      environment: {
        DATA_BUCKET_NAME: this.resources.playRecordsBucket.bucketName
      }
    }
  }

  get methodResponses() : MethodResponse[] {
    return [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
      responseModels: {
        'application/json': this.models.BasicObjectModel
      }
    }]
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
