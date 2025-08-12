// container.bicep
// Azure Container Apps deployment for telemetry ingestor

param location string = resourceGroup().location
param containerAppName string
param containerEnvironmentName string
param containerRegistryName string
param logAnalyticsWorkspaceName string
param managedIdentityName string
param imageName string = 'telemetry-ingestor'
param imageTag string = 'latest'

// Container registry for storing images
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Log Analytics workspace for container logs
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Managed Identity for container app
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

// Container Apps Environment
resource containerEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerEnvironmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

// Role assignment: AcrPull for managed identity
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: containerRegistry
  name: guid(containerRegistry.id, userAssignedIdentity.id, 'AcrPull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: userAssignedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Container App
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: userAssignedIdentity.id
        }
      ]
      secrets: [
        {
          name: 'eventstream-url'
          value: '' // Will be set via environment variables or Key Vault
        }
        {
          name: 'fabric-tenant-id'
          value: '' // Will be set via environment variables or Key Vault
        }
        {
          name: 'fabric-client-id'
          value: '' // Will be set via environment variables or Key Vault
        }
        {
          name: 'fabric-client-secret'
          value: '' // Will be set via environment variables or Key Vault
        }
      ]
    }
    template: {
      containers: [
        {
          name: imageName
          image: '${containerRegistry.properties.loginServer}/${imageName}:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'HTTP_MODE'
              value: 'true'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'EVENTSTREAM_INGEST_URL'
              secretRef: 'eventstream-url'
            }
            {
              name: 'FABRIC_TENANT_ID'
              secretRef: 'fabric-tenant-id'
            }
            {
              name: 'FABRIC_CLIENT_ID'
              secretRef: 'fabric-client-id'
            }
            {
              name: 'FABRIC_CLIENT_SECRET'
              secretRef: 'fabric-client-secret'
            }
            {
              name: 'FABRIC_MI_CLIENT_ID'
              value: userAssignedIdentity.properties.clientId
            }
            {
              name: 'SCHEMA_HINT'
              value: 'any'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 30
              periodSeconds: 10
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output managedIdentityId string = userAssignedIdentity.id
output containerAppId string = containerApp.id
