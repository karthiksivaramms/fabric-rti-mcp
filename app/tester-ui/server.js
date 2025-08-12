const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Validation schemas
const configSchema = Joi.object({
  telemetryIngestorUrl: Joi.string().uri().required(),
  azureTenantId: Joi.string().uuid().required(),
  azureClientId: Joi.string().uuid().required(),
  fabricWorkspaceId: Joi.string().uuid().optional(),
  eventstreamName: Joi.string().min(1).max(100).optional(),
  testMode: Joi.boolean().default(false)
});

const telemetrySchema = Joi.object({
  timestamp: Joi.string().isoDate().required(),
  source: Joi.string().min(1).max(100).required(),
  metric: Joi.string().min(1).max(100).required(),
  value: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  tags: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number())).optional()
});

// In-memory storage for demo (use proper database in production)
let configurations = {};
let testResults = [];

// Routes

// Serve main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuration management
app.post('/api/config', async (req, res) => {
  try {
    const { error, value } = configSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const configId = uuidv4();
    configurations[configId] = {
      id: configId,
      ...value,
      createdAt: new Date().toISOString(),
      lastTested: null
    };

    res.json({
      success: true,
      configId,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Config save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration'
    });
  }
});

app.get('/api/config/:configId', (req, res) => {
  const config = configurations[req.params.configId];
  if (!config) {
    return res.status(404).json({
      success: false,
      error: 'Configuration not found'
    });
  }

  res.json({
    success: true,
    config
  });
});

app.get('/api/configs', (req, res) => {
  res.json({
    success: true,
    configs: Object.values(configurations)
  });
});

// Health check for telemetry ingestor
app.post('/api/test/health', async (req, res) => {
  try {
    const { telemetryIngestorUrl } = req.body;
    
    if (!telemetryIngestorUrl) {
      return res.status(400).json({
        success: false,
        error: 'Telemetry ingestor URL is required'
      });
    }

    const startTime = Date.now();
    const response = await axios.get(`${telemetryIngestorUrl}/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'MCP-Tester-UI/1.0.0'
      }
    });
    
    const responseTime = Date.now() - startTime;

    const testResult = {
      id: uuidv4(),
      type: 'health_check',
      timestamp: new Date().toISOString(),
      success: true,
      responseTime,
      response: response.data,
      status: response.status
    };

    testResults.unshift(testResult);
    if (testResults.length > 100) testResults.pop(); // Keep last 100 results

    res.json({
      success: true,
      result: testResult
    });
  } catch (error) {
    const testResult = {
      id: uuidv4(),
      type: 'health_check',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      status: error.response?.status || 'timeout'
    };

    testResults.unshift(testResult);
    if (testResults.length > 100) testResults.pop();

    res.json({
      success: false,
      result: testResult
    });
  }
});

// Test telemetry ingestion
app.post('/api/test/ingest', async (req, res) => {
  try {
    const { telemetryIngestorUrl, telemetryData } = req.body;

    if (!telemetryIngestorUrl) {
      return res.status(400).json({
        success: false,
        error: 'Telemetry ingestor URL is required'
      });
    }

    // Validate telemetry data
    const { error } = telemetrySchema.validate(telemetryData);
    if (error) {
      return res.status(400).json({
        success: false,
        error: `Invalid telemetry data: ${error.details[0].message}`
      });
    }

    const startTime = Date.now();
    const response = await axios.post(`${telemetryIngestorUrl}/ingest`, telemetryData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-Tester-UI/1.0.0'
      }
    });

    const responseTime = Date.now() - startTime;

    const testResult = {
      id: uuidv4(),
      type: 'telemetry_ingest',
      timestamp: new Date().toISOString(),
      success: true,
      responseTime,
      request: telemetryData,
      response: response.data,
      status: response.status
    };

    testResults.unshift(testResult);
    if (testResults.length > 100) testResults.pop();

    res.json({
      success: true,
      result: testResult
    });
  } catch (error) {
    const testResult = {
      id: uuidv4(),
      type: 'telemetry_ingest',
      timestamp: new Date().toISOString(),
      success: false,
      request: req.body.telemetryData,
      error: error.message,
      status: error.response?.status || 'timeout',
      details: error.response?.data || null
    };

    testResults.unshift(testResult);
    if (testResults.length > 100) testResults.pop();

    res.json({
      success: false,
      result: testResult
    });
  }
});

// Batch telemetry test
app.post('/api/test/batch', async (req, res) => {
  try {
    const { telemetryIngestorUrl, batchSize = 10, interval = 1000 } = req.body;

    if (!telemetryIngestorUrl) {
      return res.status(400).json({
        success: false,
        error: 'Telemetry ingestor URL is required'
      });
    }

    const batchResults = [];
    const startTime = Date.now();

    for (let i = 0; i < batchSize; i++) {
      const telemetryData = generateSampleTelemetry(i);
      
      try {
        const response = await axios.post(`${telemetryIngestorUrl}/ingest`, telemetryData, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MCP-Tester-UI/1.0.0'
          }
        });

        batchResults.push({
          index: i,
          success: true,
          status: response.status,
          data: telemetryData
        });
      } catch (error) {
        batchResults.push({
          index: i,
          success: false,
          error: error.message,
          status: error.response?.status || 'timeout',
          data: telemetryData
        });
      }

      if (i < batchSize - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = batchResults.filter(r => r.success).length;

    const testResult = {
      id: uuidv4(),
      type: 'batch_test',
      timestamp: new Date().toISOString(),
      success: successCount > 0,
      totalTime,
      batchSize,
      successCount,
      failureCount: batchSize - successCount,
      results: batchResults
    };

    testResults.unshift(testResult);
    if (testResults.length > 100) testResults.pop();

    res.json({
      success: true,
      result: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get test results
app.get('/api/test/results', (req, res) => {
  res.json({
    success: true,
    results: testResults.slice(0, 50) // Return last 50 results
  });
});

// Clear test results
app.delete('/api/test/results', (req, res) => {
  testResults = [];
  res.json({
    success: true,
    message: 'Test results cleared'
  });
});

// Generate example telemetry data
app.get('/api/examples/telemetry', (req, res) => {
  const examples = [
    {
      name: 'Web Application Metrics',
      data: {
        timestamp: new Date().toISOString(),
        source: 'web-app',
        metric: 'page_views',
        value: 1,
        tags: {
          page: '/dashboard',
          user_id: '12345',
          session_id: 'sess_abc123',
          browser: 'Chrome'
        }
      }
    },
    {
      name: 'API Performance',
      data: {
        timestamp: new Date().toISOString(),
        source: 'api-gateway',
        metric: 'response_time_ms',
        value: 245,
        tags: {
          endpoint: '/api/users',
          method: 'GET',
          status_code: 200,
          region: 'us-east-1'
        }
      }
    },
    {
      name: 'IoT Sensor Data',
      data: {
        timestamp: new Date().toISOString(),
        source: 'iot-sensor',
        metric: 'temperature_celsius',
        value: 23.5,
        tags: {
          device_id: 'sensor_001',
          location: 'warehouse_a',
          floor: '2',
          zone: 'cooling'
        }
      }
    },
    {
      name: 'Business Metrics',
      data: {
        timestamp: new Date().toISOString(),
        source: 'ecommerce',
        metric: 'order_value_usd',
        value: 156.99,
        tags: {
          customer_id: 'cust_789',
          product_category: 'electronics',
          payment_method: 'credit_card',
          channel: 'mobile'
        }
      }
    },
    {
      name: 'System Performance',
      data: {
        timestamp: new Date().toISOString(),
        source: 'kubernetes',
        metric: 'cpu_usage_percent',
        value: 78.2,
        tags: {
          node: 'worker-01',
          namespace: 'production',
          pod: 'api-server-abc123',
          container: 'main'
        }
      }
    }
  ];

  res.json({
    success: true,
    examples
  });
});

// Helper function to generate sample telemetry
function generateSampleTelemetry(index) {
  const sources = ['web-app', 'api-gateway', 'iot-sensor', 'mobile-app', 'batch-job'];
  const metrics = ['page_views', 'response_time_ms', 'temperature', 'cpu_usage', 'memory_mb'];
  
  return {
    timestamp: new Date().toISOString(),
    source: sources[index % sources.length],
    metric: metrics[index % metrics.length],
    value: Math.floor(Math.random() * 100) + 1,
    tags: {
      test_batch: 'batch_test',
      index: index,
      random_id: Math.random().toString(36).substring(7)
    }
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 MCP Tester UI running at http://localhost:${PORT}`);
  console.log(`📊 Ready to test your Fabric RTI MCP Telemetry Client!`);
});

module.exports = app;
