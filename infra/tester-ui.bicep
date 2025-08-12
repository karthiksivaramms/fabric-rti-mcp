@description('Location for all resources')
param location string = resourceGroup().location

@description('Name of the container environment')
param containerEnvironmentName string

@description('Name of the container app for tester UI')
param testerAppName string = 'mcp-tester-ui'

@description('Container image for the tester UI')
param testerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Target port for the tester UI')
param testerTargetPort int = 3001

@description('CPU cores for the tester UI (as string)')
param testerCpu string = '0.25'

@description('Memory for the tester UI')
param testerMemory string = '0.5Gi'

@description('Minimum number of replicas')
param testerMinReplicas int = 1

@description('Maximum number of replicas')
param testerMaxReplicas int = 3

@description('Tags to apply to all resources')
param tags object = {}

// Get existing container environment
resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerEnvironmentName
}

// MCP Tester UI Container App
resource mcpTesterApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: testerAppName
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: testerTargetPort
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: false
        }
      }
      dapr: {
        enabled: false
      }
    }
    template: {
      containers: [
        {
          image: testerImage
          name: 'mcp-tester-ui'
          resources: {
            cpu: json(testerCpu)
            memory: testerMemory
          }
          env: [
            {
              name: 'PORT'
              value: string(testerTargetPort)
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'LOG_LEVEL'
              value: 'info'
            }
            {
              name: 'RATE_LIMIT_WINDOW_MS'
              value: '900000'
            }
            {
              name: 'RATE_LIMIT_MAX_REQUESTS'
              value: '100'
            }
          ]
          probes: [
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/test/results'
                port: testerTargetPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/test/results'
                port: testerTargetPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              timeoutSeconds: 5
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: testerMinReplicas
        maxReplicas: testerMaxReplicas
        rules: [
          {
            name: 'http-scaling-rule'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
output testerAppName string = mcpTesterApp.name
output testerAppFqdn string = mcpTesterApp.properties.configuration.ingress.fqdn
output testerAppUrl string = 'https://${mcpTesterApp.properties.configuration.ingress.fqdn}'
