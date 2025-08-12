# GitHub Actions Deployment Troubleshooting

## 🚨 Common Issue: "All jobs have failed" Email

If you received a deployment failure email, here are the most common causes and solutions:

### 1. Missing GitHub Secrets ❌

**Problem**: The workflow requires Azure authentication secrets that aren't configured.

**Solution**: Add these secrets to your GitHub repository:

1. Go to your repository: `https://github.com/karthiksivaramms/fabric-rti-mcp`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AZURE_TENANT_ID` | Your Azure AD tenant ID | `az account show --query tenantId -o tsv` |
| `AZURE_CLIENT_ID` | Service principal client ID | See "Create Service Principal" below |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | `az account show --query id -o tsv` |

### 2. Create Service Principal for GitHub OIDC

Run these commands in Azure Cloud Shell or Azure CLI:

```bash
# Set variables
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
REPO_OWNER="karthiksivaramms"
REPO_NAME="fabric-rti-mcp"

# Create service principal with OIDC
az ad app create --display-name "github-actions-fabric-rti-mcp"
APP_ID=$(az ad app list --display-name "github-actions-fabric-rti-mcp" --query "[0].appId" -o tsv)

# Create service principal
az ad sp create --id $APP_ID

# Create role assignment
az role assignment create \
  --role "Contributor" \
  --assignee $APP_ID \
  --scope "/subscriptions/$SUBSCRIPTION_ID"

# Configure OIDC federation
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'$REPO_OWNER'/'$REPO_NAME':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

echo "✅ Service Principal created!"
echo "📋 Add these secrets to GitHub:"
echo "AZURE_CLIENT_ID: $APP_ID"
echo "AZURE_TENANT_ID: $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
```

### 3. Invalid Bicep Template ❌

**Problem**: The original template uses experimental Fabric ARM resources.

**Solution**: The workflow now defaults to using `main-simple.bicep` which deploys:
- ✅ Managed Identity
- ✅ Storage Account
- ✅ Container Apps Environment
- ✅ Log Analytics Workspace

### 4. JSON Syntax Error ❌

**Problem**: Invalid JSON in parameters file.

**Solution**: Fixed the trailing comma in `main.parameters.json`.

### 5. Test the Fixed Deployment

After adding the secrets, trigger a deployment:

**Option A: Push changes** (automatic trigger)
```bash
git add .
git commit -m "Fix deployment issues"
git push origin main
```

**Option B: Manual trigger**
1. Go to **Actions** tab in your GitHub repository
2. Select **deploy-infra** workflow
3. Click **Run workflow**
4. Choose **Use simplified template: true** (recommended)

### 6. Monitor Deployment

Watch the deployment progress:
1. Go to **Actions** tab
2. Click on the running workflow
3. Expand the **deploy** job to see detailed logs

### 7. Expected Success Output

When successful, you should see:
```
✅ Infrastructure deployment completed!

📋 Next steps:
1. Set up your Fabric workspace at https://fabric.microsoft.com
2. Run the fabric-provision script to create RTI items
3. Deploy the container app using the build-and-release workflow
```

### 8. Alternative: Manual Deployment

If GitHub Actions continue to fail, deploy manually:

```bash
# Login to Azure
az login
az account set --subscription <your-subscription-id>

# Deploy infrastructure
az group create --name rg-fabric-rti-mcp --location eastus
az deployment group create \
  --resource-group rg-fabric-rti-mcp \
  --template-file infra/main-simple.bicep \
  --parameters @infra/main-simple.parameters.json
```

### 9. Need Help?

- 📖 Check the [workflow logs](https://github.com/karthiksivaramms/fabric-rti-mcp/actions)
- 🐛 [Open an issue](https://github.com/karthiksivaramms/fabric-rti-mcp/issues)
- 💬 Review the deployment output in the Actions tab

## ✅ Verification Checklist

- [ ] GitHub secrets are configured (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID)
- [ ] Service principal has Contributor role on subscription
- [ ] OIDC federation is configured for the repository
- [ ] Using the simplified template (main-simple.bicep)
- [ ] JSON syntax is valid in parameter files
