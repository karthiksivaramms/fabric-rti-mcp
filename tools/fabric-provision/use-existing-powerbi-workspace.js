import 'dotenv/config'
import fetch from 'cross-fetch'
import { DefaultAzureCredential } from '@azure/identity'

// Script to work with existing Power BI/Fabric workspace
const FABRIC_SCOPE = 'https://analysis.windows.net/powerbi/api/.default'
const FABRIC_API = 'https://api.fabric.microsoft.com/v1'

async function getToken() {
  const cred = new DefaultAzureCredential()
  const token = await cred.getToken(FABRIC_SCOPE)
  return token.token
}

async function getWorkspaces() {
  const token = await getToken()
  const res = await fetch(`${FABRIC_API}/workspaces`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get workspaces failed: ${res.status} ${res.statusText} - ${text}`)
  }
  return res.json()
}

async function createItem(workspaceId, payload) {
  const token = await getToken()
  const res = await fetch(`${FABRIC_API}/workspaces/${workspaceId}/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create item failed: ${res.status} ${res.statusText} - ${text}`)
  }
  return res.json()
}

async function main() {
  console.log('Getting your available workspaces...')
  
  try {
    const workspaces = await getWorkspaces()
    console.log('\n=== Available Workspaces ===')
    workspaces.value.forEach((ws, index) => {
      console.log(`${index + 1}. ${ws.displayName} (${ws.id})`)
      console.log(`   Type: ${ws.type}`)
      if (ws.capacityId) {
        console.log(`   Capacity: ${ws.capacityId}`)
      }
      console.log('')
    })
    
    // Instructions for manual setup
    console.log('\n=== Next Steps ===')
    console.log('1. Go to https://app.powerbi.com or https://fabric.microsoft.com')
    console.log('2. Select one of your workspaces listed above')
    console.log('3. Create these items:')
    console.log('   - New > Real-Time Intelligence > Eventstream (name: telemetry-eventstream)')
    console.log('   - New > Real-Time Intelligence > KQL Database (name: telemetry-eventhouse)')
    console.log('   - New > Data Activator > Reflex (name: telemetry-activator)')
    console.log('4. Configure the Eventstream to receive data from our container app')
    
    // If you want to try automated creation, uncomment and modify:
    /*
    const workspaceId = 'YOUR_WORKSPACE_ID_HERE'
    console.log(`\nTrying to create items in workspace ${workspaceId}...`)
    
    try {
      const eventstream = await createItem(workspaceId, {
        displayName: 'telemetry-eventstream',
        type: 'Eventstream'
      })
      console.log('Eventstream created:', eventstream.id)
    } catch (err) {
      console.log('Eventstream creation failed:', err.message)
    }
    */
    
  } catch (error) {
    console.error('Error accessing workspaces:', error.message)
    console.log('\nAlternative: Use the Power BI/Fabric portal directly:')
    console.log('1. Go to: https://app.powerbi.com/groups/me/list')
    console.log('2. Select your workspace')
    console.log('3. Create RTI items manually')
  }
}

main().catch(err => { 
  console.error('Script error:', err.message)
})
