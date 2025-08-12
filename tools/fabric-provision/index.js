import 'dotenv/config'
import fetch from 'cross-fetch'
import { ClientSecretCredential } from '@azure/identity'

// Minimal Fabric REST wrapper (workspace items)
const FABRIC_SCOPE = 'https://analysis.windows.net/powerbi/api/.default'
const FABRIC_API = 'https://api.fabric.microsoft.com/v1'

async function getToken() {
  const tenantId = process.env.FABRIC_TENANT_ID
  const clientId = process.env.FABRIC_CLIENT_ID
  const clientSecret = process.env.FABRIC_CLIENT_SECRET
  const cred = new ClientSecretCredential(tenantId, clientId, clientSecret)
  const token = await cred.getToken(FABRIC_SCOPE)
  return token.token
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

async function createWorkspace(displayName, capacityId) {
  if (!displayName) throw new Error('FABRIC_WORKSPACE_NAME is required when FABRIC_WORKSPACE_ID is not provided')
  if (!capacityId) throw new Error('FABRIC_CAPACITY_ID is required to create a workspace')
  const token = await getToken()
  const res = await fetch(`${FABRIC_API}/workspaces`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ displayName, capacityId })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create workspace failed: ${res.status} ${res.statusText} - ${text}`)
  }
  return res.json()
}

async function main() {
  let workspaceId = process.env.FABRIC_WORKSPACE_ID
  if (!workspaceId) {
    console.log('FABRIC_WORKSPACE_ID not provided; creating workspace via REST...')
    const name = process.env.FABRIC_WORKSPACE_NAME
    const capacityId = process.env.FABRIC_CAPACITY_ID
    const ws = await createWorkspace(name, capacityId)
    workspaceId = ws?.id || ws?.workspaceId || ws?.identifier
    if (!workspaceId) throw new Error('Failed to resolve workspace ID from creation response')
    console.log('Workspace created:', workspaceId)
  }

  // Eventstream item payload (example; adjust to current API spec if needed)
  const eventstreamName = process.env.EVENTSTREAM_ITEM_NAME || 'eventstream'
  const eventhouseName = process.env.EVENTHOUSE_ITEM_NAME || 'eventhouse'
  const activatorName = process.env.ACTIVATOR_ITEM_NAME || 'activator'

  console.log('Creating Eventstream item...')
  const es = await createItem(workspaceId, {
    displayName: eventstreamName,
    type: 'Eventstream'
  })
  console.log('Eventstream created:', es)

  console.log('Creating Eventhouse item...')
  const eh = await createItem(workspaceId, {
    displayName: eventhouseName,
    type: 'KQLDatabase'
  })
  console.log('Eventhouse created:', eh)

  console.log('Creating Activator item...')
  const act = await createItem(workspaceId, {
    displayName: activatorName,
    type: 'Activator'
  })
  console.log('Activator created:', act)
}

main().catch(err => { console.error(err); process.exit(1) })
