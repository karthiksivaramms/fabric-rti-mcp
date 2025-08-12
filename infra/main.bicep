// main.bicep
// Fabric RTI deployment: Eventstream, Eventhouse, Activator, and Workspace

param location string = resourceGroup().location
param fabricWorkspaceName string
param eventstreamName string
param eventhouseName string
param activatorName string
param managedIdentityName string
@description('Set to true to attempt deploying Fabric resources via ARM (experimental). Default false; use tools/fabric-provision for REST-based creation.')
param deployFabricViaArm bool = false

// Deploy Managed Identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

// Deploy Fabric Workspace (via ARM experimental resource type)
// Note: Fabric workspaces and items are primarily managed via Fabric REST APIs.
// This resource type may not be generally available. If deployment fails,
// use tools/fabric-provision to create the workspace via Fabric REST.
resource fabricWorkspace 'Microsoft.Fabric/workspaces@2024-01-01-preview' = if (deployFabricViaArm) {
  name: fabricWorkspaceName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {}
}

// Deploy Eventstream
resource eventstream 'Microsoft.Fabric/workspaces/eventstreams@2024-01-01-preview' = if (deployFabricViaArm) {
  name: eventstreamName
  parent: fabricWorkspace
  location: location
  properties: {
    // Add Eventstream properties as needed
  }
}

// Deploy Eventhouse
resource eventhouse 'Microsoft.Fabric/workspaces/eventhouses@2024-01-01-preview' = if (deployFabricViaArm) {
  name: eventhouseName
  parent: fabricWorkspace
  location: location
  properties: {
    // Add Eventhouse properties as needed
  }
}

// Deploy Activator
resource activator 'Microsoft.Fabric/workspaces/activators@2024-01-01-preview' = if (deployFabricViaArm) {
  name: activatorName
  parent: fabricWorkspace
  location: location
  properties: {
    // Add Activator properties as needed
  }
}

var fabricEnabled = deployFabricViaArm

output fabricWorkspaceId string = fabricEnabled ? fabricWorkspace.id : 'not-deployed'
output eventstreamId string = fabricEnabled ? eventstream.id : 'not-deployed'
output eventhouseId string = fabricEnabled ? eventhouse.id : 'not-deployed'
output activatorId string = fabricEnabled ? activator.id : 'not-deployed'
output managedIdentityId string = userAssignedIdentity.id
