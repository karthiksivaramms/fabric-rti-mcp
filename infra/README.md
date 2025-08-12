# Fabric RTI Bicep Deployment

This deployment sets up a Microsoft Fabric Real-Time Intelligence (RTI) environment with:
- Fabric Workspace (using Fabric APIs)
- Eventstream (for real-time telemetry ingestion)
- Eventhouse (for analytics and storage)
- Activator (for event-driven actions)
- Managed Identity (for secure integration)

## Files
- `infra/main.bicep`: Main Bicep template
- `infra/main.parameters.json`: Example parameters

## Deployment

```powershell
# Login to Azure
az login

# Set your subscription
az account set --subscription <your-subscription-id>

# Create a resource group (if needed)
az group create --name <resource-group> --location <location>

# Deploy the Bicep template (ARM Fabric types optional)
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json

# To attempt ARM-based Fabric resource creation, add:
# --parameters deployFabricViaArm=true
```

## Next Steps
- Use the outputs to configure the MCP telemetry client for onboarding data.
- See the MCP client repo: https://github.com/karthiksivaramms/mcp-telemetry-client

If ARM-based Fabric types fail (preview/unsupported), use the GitHub Action 'fabric-provision' or run the script in tools/fabric-provision to create Fabric items via REST.

---

For open source, you can add more documentation and parameterize as needed.
