// main-simple.bicep
// Simplified deployment focusing on core Azure resources (not experimental Fabric ARM resources)

param location string = resourceGroup().location
param managedIdentityName string = 'fabric-rti-identity'
param storageAccountName string = 'fabricrtistorage${uniqueString(resourceGroup().id)}'
param containerAppEnvName string = 'fabric-rti-env'

// Deploy Managed Identity for authentication
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
  tags: {
    purpose: 'fabric-rti-telemetry'
    'azd-env-name': 'fabric-rti-mcp'
  }
}

// Storage Account for function app requirements (if using Azure Functions)
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
  tags: {
    purpose: 'fabric-rti-telemetry'
    'azd-env-name': 'fabric-rti-mcp'
  }
}

// Log Analytics Workspace for monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'fabric-rti-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    purpose: 'fabric-rti-telemetry'
    'azd-env-name': 'fabric-rti-mcp'
  }
}

// Container Apps Environment
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
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
  tags: {
    purpose: 'fabric-rti-telemetry'
    'azd-env-name': 'fabric-rti-mcp'
  }
}

// Outputs
output managedIdentityId string = userAssignedIdentity.id
output managedIdentityClientId string = userAssignedIdentity.properties.clientId
output storageAccountName string = storageAccount.name
output containerAppEnvironmentId string = containerAppEnvironment.id
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id

// Instructions for Fabric workspace setup
output fabricSetupInstructions string = '''
NEXT STEPS FOR FABRIC SETUP:
1. Go to https://fabric.microsoft.com
2. Create or select a workspace
3. Run the fabric-provision script: npm run provision (in tools/fabric-provision/)
4. Or manually create:
   - Eventstream (for data ingestion)
   - KQL Database/Eventhouse (for data storage)
   - Data Activator/Reflex (for real-time alerts)
'''
