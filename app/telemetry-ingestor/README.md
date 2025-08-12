# Telemetry Ingestor (MCP client integration)

This lightweight Node.js app accepts ANY telemetry payload and forwards it to Fabric Eventstream.

- Accepts JSON or raw strings (stdin or programmatic)
- Uses Azure AD (client secret or managed identity) to call Eventstream ingest endpoint
- Compatible with https://github.com/karthiksivaramms/mcp-telemetry-client

## Setup

```powershell
cd app/telemetry-ingestor
copy .env.example .env
# Edit .env with your values
npm install
npm run start -- --example
```

Environment variables:
- EVENTSTREAM_INGEST_URL: Eventstream HTTPS ingest URL (from Fabric/outputs)
- FABRIC_TENANT_ID, FABRIC_CLIENT_ID, FABRIC_CLIENT_SECRET: App registration for auth
- FABRIC_MI_CLIENT_ID: Optional user-assigned managed identity clientId
- SCHEMA_HINT: Optional label for schema routing
 - MCP_CLIENT_PATH: Optional path to a JS module from mcp-telemetry-client exporting a transform(input, ctx) function

## Pipe data
```powershell
# JSON lines
Get-Content .\data.jsonl | node .\src\index.js

# Random strings
Get-Content .\logs.txt | node .\src\index.js
```

## Using MCP client transforms
Provide a module path in `MCP_CLIENT_PATH` that exports either default or named `transform(input, ctx)` which returns the final payload object to POST to Eventstream.

Example shape:
```js
// example-transform.js
export function transform(input, { schemaHint }) {
	const payload = typeof input === 'string' ? { message: input } : input
	return { payload: JSON.stringify(payload), schema: schemaHint }
}
```
