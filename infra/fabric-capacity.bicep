// fabric-capacity.bicep
// Deploy Microsoft Fabric capacity with minimal F2 SKU

param location string = resourceGroup().location
param fabricCapacityName string = 'fabric-rti-capacity'
param skuName string = 'F2'
param adminUsers array = []

// Fabric Capacity
resource fabricCapacity 'Microsoft.Fabric/capacities@2023-11-01' = {
  name: fabricCapacityName
  location: location
  sku: {
    name: skuName
    tier: 'Fabric'
  }
  properties: {
    administration: {
      members: adminUsers
    }
  }
}

output fabricCapacityId string = fabricCapacity.id
output fabricCapacityName string = fabricCapacity.name
