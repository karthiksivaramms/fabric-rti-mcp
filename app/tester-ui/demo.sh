#!/bin/bash

# Demo Script for MCP Tester UI
# This script demonstrates the key features of the MCP Tester UI

set -e

echo "🧪 MCP Tester UI Demo Script"
echo "================================"

# Configuration
TESTER_UI_URL="${TESTER_UI_URL:-http://localhost:3001}"
TELEMETRY_INGESTOR_URL="${TELEMETRY_INGESTOR_URL:-http://localhost:3000}"

echo "📋 Configuration:"
echo "  Tester UI URL: $TESTER_UI_URL"
echo "  Telemetry Ingestor URL: $TELEMETRY_INGESTOR_URL"
echo ""

# Function to check if service is running
check_service() {
    local url=$1
    local name=$2
    echo "🔍 Checking if $name is running at $url..."
    
    if curl -f -s "$url/health" > /dev/null 2>&1 || curl -f -s "$url/api/test/results" > /dev/null 2>&1; then
        echo "✅ $name is running"
        return 0
    else
        echo "❌ $name is not responding"
        return 1
    fi
}

# Function to test API endpoint
test_endpoint() {
    local url=$1
    local method=${2:-GET}
    local data=$3
    local description=$4
    
    echo "🧪 Testing: $description"
    echo "   URL: $method $url"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s "$url")
    fi
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo "✅ Success - Valid JSON response"
        echo "$response" | jq '.' | head -10
    else
        echo "⚠️  Response (non-JSON):"
        echo "$response" | head -5
    fi
    echo ""
}

echo "🚀 Starting MCP Tester UI Demo"
echo ""

# 1. Check services
echo "1️⃣ Service Health Checks"
echo "------------------------"
check_service "$TESTER_UI_URL" "Tester UI"
check_service "$TELEMETRY_INGESTOR_URL" "Telemetry Ingestor" || echo "   Note: Telemetry ingestor may not be running locally"
echo ""

# 2. Test Tester UI API endpoints
echo "2️⃣ Tester UI API Endpoints"
echo "--------------------------"

# Get examples
test_endpoint "$TESTER_UI_URL/api/examples/telemetry" "GET" "" "Get telemetry examples"

# Get test results (should be empty initially)
test_endpoint "$TESTER_UI_URL/api/test/results" "GET" "" "Get test results"

# Save a configuration
echo "3️⃣ Configuration Management"
echo "---------------------------"
config_data='{
  "telemetryIngestorUrl": "'"$TELEMETRY_INGESTOR_URL"'",
  "azureTenantId": "12345678-1234-1234-1234-123456789012",
  "azureClientId": "87654321-4321-4321-4321-210987654321",
  "fabricWorkspaceId": "11111111-2222-3333-4444-555555555555",
  "eventstreamName": "demo-eventstream",
  "testMode": true
}'

test_endpoint "$TESTER_UI_URL/api/config" "POST" "$config_data" "Save configuration"

# 4. Test telemetry ingestion (if ingestor is available)
echo "4️⃣ Telemetry Testing"
echo "--------------------"

if check_service "$TELEMETRY_INGESTOR_URL" "Telemetry Ingestor" > /dev/null 2>&1; then
    # Test health check through tester UI
    health_test_data='{
      "telemetryIngestorUrl": "'"$TELEMETRY_INGESTOR_URL"'"
    }'
    test_endpoint "$TESTER_UI_URL/api/test/health" "POST" "$health_test_data" "Health check via tester UI"
    
    # Test telemetry ingestion through tester UI
    telemetry_test_data='{
      "telemetryIngestorUrl": "'"$TELEMETRY_INGESTOR_URL"'",
      "telemetryData": {
        "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"'",
        "source": "demo-script",
        "metric": "demo_test",
        "value": 42,
        "tags": {
          "test_type": "demo",
          "script_version": "1.0.0"
        }
      }
    }'
    test_endpoint "$TESTER_UI_URL/api/test/ingest" "POST" "$telemetry_test_data" "Telemetry ingestion via tester UI"
    
    # Test batch ingestion
    batch_test_data='{
      "telemetryIngestorUrl": "'"$TELEMETRY_INGESTOR_URL"'",
      "batchSize": 5,
      "interval": 500
    }'
    test_endpoint "$TESTER_UI_URL/api/test/batch" "POST" "$batch_test_data" "Batch test via tester UI"
else
    echo "⚠️  Skipping telemetry tests - ingestor not available"
    echo "   Start the telemetry ingestor and run this script again for full testing"
fi

echo ""

# 5. Show final test results
echo "5️⃣ Final Test Results"
echo "---------------------"
test_endpoint "$TESTER_UI_URL/api/test/results" "GET" "" "Final test results"

echo "🎉 Demo Complete!"
echo ""
echo "📖 Next Steps:"
echo "  1. Open $TESTER_UI_URL in your browser"
echo "  2. Configure your telemetry ingestor settings"
echo "  3. Test your MCP client integration"
echo "  4. Explore the example telemetry data"
echo ""
echo "💡 Pro Tips:"
echo "  - Use the Configuration tab to save your settings"
echo "  - Try the batch testing feature for load testing"
echo "  - Check the Examples tab for MCP integration guides"
echo "  - Use JSON validation before sending test data"
