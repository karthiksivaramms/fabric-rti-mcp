# MCP Tester UI

A comprehensive web-based testing interface for the Microsoft Fabric RTI + MCP Telemetry Client. This UI allows users to:

- Configure MCP client settings
- Test telemetry ingestion endpoints
- View example telemetry data
- Monitor test results in real-time
- Validate JSON payloads

## Features

### 🔧 Configuration Management
- Save and load MCP client configurations
- Validate Azure AD and Fabric settings
- Connection health checking
- Example configuration loading

### 🧪 Testing Capabilities
- Single message testing with custom JSON
- Batch testing with configurable size and intervals
- Real-time test result monitoring
- JSON validation and formatting

### 📚 Examples & Documentation
- Pre-built telemetry examples for different use cases
- MCP client integration code samples
- Step-by-step setup guides

## Quick Start

### Installation

```bash
cd app/tester-ui
npm install
```

### Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### Running the UI

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The UI will be available at: http://localhost:3001

## Usage Guide

### 1. Configuration Tab
1. Enter your deployed telemetry ingestor URL
2. Provide Azure AD tenant and client IDs
3. Optionally configure Fabric workspace settings
4. Test the connection to verify setup

### 2. Testing Tab
1. Use the single message test for individual payloads
2. Try batch testing for load testing scenarios
3. Monitor results in the real-time results panel
4. Validate JSON before sending

### 3. Examples Tab
1. Browse pre-built telemetry examples
2. Copy examples to the testing interface
3. Follow MCP client integration guides
4. Learn about custom plugin development

## API Endpoints

The tester UI provides a REST API for programmatic access:

### Configuration
- `POST /api/config` - Save configuration
- `GET /api/config/:id` - Get configuration
- `GET /api/configs` - List all configurations

### Testing
- `POST /api/test/health` - Test ingestor health
- `POST /api/test/ingest` - Test single telemetry message
- `POST /api/test/batch` - Run batch test
- `GET /api/test/results` - Get test results
- `DELETE /api/test/results` - Clear test results

### Examples
- `GET /api/examples/telemetry` - Get example telemetry data

## Security Features

- Rate limiting on API endpoints
- Input validation with Joi schemas
- Helmet.js security headers
- CORS protection
- XSS protection via CSP headers

## Development

### Adding New Examples

Add new telemetry examples in `server.js`:

```javascript
const examples = [
  {
    name: 'Your Example Name',
    data: {
      timestamp: new Date().toISOString(),
      source: 'your-source',
      metric: 'your-metric',
      value: 'your-value',
      tags: {
        // your tags
      }
    }
  }
];
```

### Custom Styling

The UI uses Tailwind CSS for styling. Customize styles in `public/index.html` or add custom CSS files.

### Extending API

Add new API endpoints in `server.js`:

```javascript
app.post('/api/your-endpoint', async (req, res) => {
  // Your custom logic
});
```

## Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Azure Container Apps

Use the included Bicep templates to deploy alongside your main telemetry ingestor.

## Troubleshooting

### Common Issues

1. **Connection Failed**: Verify your telemetry ingestor URL is correct and accessible
2. **Authentication Error**: Check Azure AD tenant and client IDs
3. **CORS Issues**: Ensure your ingestor allows requests from the tester UI domain
4. **Rate Limited**: Reduce test frequency or contact administrator

### Debug Mode

Set `LOG_LEVEL=debug` in your environment to enable detailed logging.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
