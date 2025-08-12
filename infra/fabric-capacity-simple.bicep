// Simplified Fabric capacity deployment
param location string = resourceGroup().location
param fabricCapacityName string = 'fabriccapacity001'
param skuName string = 'F2'

// Fabric Capacity - minimal configuration
resource fabricCapacity 'Microsoft.Fabric/capacities@2023-11-01' = {
  name: fabricCapacityName
  location: location
  sku: {
    name: skuName
    tier: 'Fabric'
  }
  properties: {
    administration: {
      members: [
        'kmurugesan@microsoft.com'
      ]
    }
  }
}

output fabricCapacityId string = fabricCapacity.id
output fabricCapacityName string = fabricCapacity.name
