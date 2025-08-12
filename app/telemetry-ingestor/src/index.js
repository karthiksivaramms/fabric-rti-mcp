import 'dotenv/config'
import fetch from 'cross-fetch'
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:http'

// Simple pluggable normalizer so we can accept ANY telemetry (object|string|buffer)
function normalize(input, schemaHint = 'any') {
  if (Buffer.isBuffer(input)) return { payload: input.toString('utf8'), schema: schemaHint }
  if (typeof input === 'string') return { payload: input, schema: schemaHint }
  if (typeof input === 'object') return { payload: JSON.stringify(input), schema: schemaHint }
  return { payload: String(input), schema: schemaHint }
}

let pluginTransform = null
async function loadMcpPlugin() {
  const pluginPath = process.env.MCP_CLIENT_PATH
  if (!pluginPath) return null
  try {
    const full = path.isAbsolute(pluginPath) ? pluginPath : path.join(process.cwd(), pluginPath)
    const mod = await import(pathToFileURL(full).href)
    // Expected shape: default function or named 'transform'
    const fn = (typeof mod?.default === 'function') ? mod.default : (typeof mod?.transform === 'function' ? mod.transform : null)
    if (fn) {
      pluginTransform = fn
      console.log('Loaded MCP client transform from', full)
      return fn
    }
    console.warn('MCP client module found but no export default or transform function; falling back to built-in normalize')
  } catch (e) {
    console.warn('Failed to load MCP client plugin:', e.message)
  }
  return null
}

async function getAccessToken() {
  const tenantId = process.env.FABRIC_TENANT_ID
  const clientId = process.env.FABRIC_CLIENT_ID
  const clientSecret = process.env.FABRIC_CLIENT_SECRET
  const miClientId = process.env.FABRIC_MI_CLIENT_ID

  // Fabric/Graph scopes may vary; using default resource for AAD token exchange to REST API
  const scope = 'https://analysis.windows.net/powerbi/api/.default'

  if (clientId && clientSecret && tenantId) {
    const cred = new ClientSecretCredential(tenantId, clientId, clientSecret)
    const token = await cred.getToken(scope)
    return token.token
  }
  // Fallback to DefaultAzureCredential (supports managed identity)
  const cred = new DefaultAzureCredential({ managedIdentityClientId: miClientId })
  const token = await cred.getToken(scope)
  return token?.token
}

async function sendToEventstream(payload) {
  const url = process.env.EVENTSTREAM_INGEST_URL
  if (!url) throw new Error('EVENTSTREAM_INGEST_URL is required')
  const token = await getAccessToken()

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ingest failed: ${res.status} ${res.statusText} - ${text}`)
  }
  return res.status
}

// HTTP server mode for container deployment
async function startHttpServer() {
  const port = process.env.PORT || 3000
  const schemaHint = process.env.SCHEMA_HINT || 'any'
  
  const server = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('OK')
      return
    }
    
    if (req.method === 'POST' && req.url === '/ingest') {
      try {
        let body = ''
        req.on('data', chunk => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const input = body.trim() ? (() => { try { return JSON.parse(body) } catch { return body } })() : null
            if (!input) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Empty payload' }))
              return
            }
            
            const payload = pluginTransform ? await pluginTransform(input, { schemaHint }) : normalize(input, schemaHint)
            const status = await sendToEventstream(payload)
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'sent', eventstream_status: status }))
          } catch (error) {
            console.error('Ingest error:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: error.message }))
          }
        })
      } catch (error) {
        console.error('Request error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  })
  
  server.listen(port, () => {
    console.log(`Telemetry ingestor HTTP server listening on port ${port}`)
    console.log('Endpoints: GET /health, POST /ingest')
  })
}

// Demo runner for OSS usage: pipe stdin lines as telemetry
async function main() {
  const schemaHint = process.env.SCHEMA_HINT || 'any'
  const args = process.argv.slice(2)
  await loadMcpPlugin()
  
  // Check if running in HTTP server mode
  if (process.env.HTTP_MODE === 'true' || args.includes('--http')) {
    await startHttpServer()
    return
  }
  
  if (args[0] === '--example') {
    const sampleInput = { ts: new Date().toISOString(), msg: 'hello world', source: 'demo' }
    const sample = pluginTransform ? await pluginTransform(sampleInput, { schemaHint }) : normalize(sampleInput, schemaHint)
    const status = await sendToEventstream(sample)
    console.log('Sent example event, status', status)
    return
  }

  process.stdin.setEncoding('utf8')
  console.log('Reading from stdin. Press Ctrl+C to exit.')
  for await (const chunk of process.stdin) {
    const trimmed = chunk.trim()
    if (!trimmed) continue
  const maybeJson = (() => { try { return JSON.parse(trimmed) } catch { return trimmed } })()
  const payload = pluginTransform ? await pluginTransform(maybeJson, { schemaHint }) : normalize(maybeJson, schemaHint)
    await sendToEventstream(payload)
    console.log('Sent 1 event')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
