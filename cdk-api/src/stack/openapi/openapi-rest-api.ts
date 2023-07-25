import { Duration } from 'aws-cdk-lib'
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { RequestAuthorizer, LambdaIntegration, IdentitySource, RestApi, Cors, IResource, Resource } from 'aws-cdk-lib/aws-apigateway'
import { HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53'
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'

import OpenAPIEndpoint from './openapi-endpoint'
import OpenAPIFunction from './openapi-function'
import { Verifier } from '../../routes/authorizer'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import path from 'path'

interface OpenAPIRestAPIProps {
  Description: string
  SubDomain: string
  HostedZoneDomain: string
  Verifiers: Verifier[]
}

export default class OpenAPIRestAPI extends Construct {
  restApi: RestApi
  endpoints: Array<OpenAPIEndpoint<OpenAPIFunction>>
  executionRole: Role
  cnameRecord?: CnameRecord
  private readonly routeMap: { [param: string]: IResource }

  constructor (scope: Construct, id: string, props: OpenAPIRestAPIProps) {
    super(scope, id)
    this.restApi = this.createRestApi(scope, id, props)
    this.endpoints = []
    this.executionRole = this.createExecutionRole(this)

    if (process.env.CREATE_CNAME_RECORD === 'true') {
      this.cnameRecord = this.createVanityUrl(scope, props)
    }

    this.routeMap = {
      '/': this.restApi.root
    }
  }

  private createRestApi (scope: Construct, id: string, props: OpenAPIRestAPIProps): RestApi {
    const authLambda = new NodejsFunction(scope, 'PrivateAPIAuthorizer', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../routes/authorizer.ts'),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk']
      },
      environment: {
        AUTH_VERIFIERS_JSON: JSON.stringify(props.Verifiers)
      }
    })

    const requestAuthorizer = new RequestAuthorizer(this, 'PrivateApiRequestAuthorizer', {
      handler: authLambda,
      identitySources: [IdentitySource.header('Authorization')]
    })

    const api = new RestApi(this, id, {
      description: props.Description,
      deployOptions: {
        stageName: 'v1'
      },
      defaultMethodOptions: { authorizer: requestAuthorizer },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: [
          'Authorization',
          'content-type'
        ]
      }
    })

    return api
  }

  private createExecutionRole (scope: Construct): Role {
    const executionRole = new Role(scope, 'ApiExecutionRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
    })

    return executionRole
  }

  private createVanityUrl (scope: Construct, props: OpenAPIRestAPIProps): CnameRecord {
    const vanityDomain = `${props.SubDomain}.${props.HostedZoneDomain}`
    const hostedZone = HostedZone.fromLookup(scope, 'HostedZone', {
      domainName: props.HostedZoneDomain
    })

    const cert = new Certificate(this, vanityDomain, {
      domainName: vanityDomain,
      validation: CertificateValidation.fromDns(hostedZone)
    })

    const domain = this.restApi.addDomainName(`${props.SubDomain}-domain-name`, {
      domainName: vanityDomain,
      certificate: cert
    })

    const cnameRecord = new CnameRecord(this, 'cname-record', {
      domainName: domain.domainNameAliasDomainName,
      zone: hostedZone,
      recordName: vanityDomain,
      ttl: Duration.minutes(5)
    })
    return cnameRecord
  }

  private makeRouteResource (routeMap: { [param: string]: IResource }, path: string): Resource {
    const pathParts = path.split('/').filter(n => n)
    const pathLeaf = pathParts.pop()
    const pathBranch = '/' + pathParts.join('/')

    if (pathLeaf !== null && pathLeaf !== undefined) {
      const parent: IResource = routeMap[pathBranch] ?? this.makeRouteResource(routeMap, pathBranch)
      const resource = parent.addResource(pathLeaf)
      routeMap[path] = resource
      return resource
    } else {
      throw new Error(`Unable to make route resource; unexpectedly short path: ${path}`)
    }
  }

  get (path: string, lambda: OpenAPIFunction): OpenAPIRestAPI {
    const endpoint = new OpenAPIEndpoint(HttpMethod.GET, path, lambda)
    return this.addEndpoint(endpoint)
  }

  post (path: string, lambda: OpenAPIFunction): OpenAPIRestAPI {
    const endpoint = new OpenAPIEndpoint(HttpMethod.POST, path, lambda)
    return this.addEndpoint(endpoint)
  }

  put (path: string, lambda: OpenAPIFunction): OpenAPIRestAPI {
    const endpoint = new OpenAPIEndpoint(HttpMethod.PUT, path, lambda)
    return this.addEndpoint(endpoint)
  }

  delete (path: string, lambda: OpenAPIFunction): OpenAPIRestAPI {
    const endpoint = new OpenAPIEndpoint(HttpMethod.DELETE, path, lambda)
    return this.addEndpoint(endpoint)
  }

  private addEndpoint (endpoint: OpenAPIEndpoint<OpenAPIFunction>): OpenAPIRestAPI {
    const { endpoints, routeMap, executionRole } = this
    endpoints.push(endpoint)

    executionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [endpoint.value?.lambda?.functionArn ?? 'undefined-endpoint-arn'],
      actions: ['lambda:InvokeFunction']
    }))

    const routeResource = routeMap[endpoint.path] ?? this.makeRouteResource(routeMap, endpoint.path)
    if (endpoint.value.lambda !== undefined) {
      routeResource.addMethod(
        endpoint.httpMethod,
        new LambdaIntegration(endpoint.value.lambda, {
          proxy: true,
          credentialsRole: executionRole
        }),
        endpoint.value.methodOptions
      )
    } else {
      console.warn('OpenAPIRestAPI: Supplied endpoint does not have a lambda associated; skipping value:', endpoint.httpMethod, endpoint.path)
    }

    return this
  }

  report (): void {
    console.log('OpenAPIRestAPI Routes:', Object.values(this.routeMap).map(route => route.path))
  }
}
