# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial open source release
- Complete Bicep infrastructure templates for Microsoft Fabric RTI
- Node.js telemetry ingestor with HTTP endpoints
- MCP (Model Context Protocol) client integration framework
- Docker containerization with multi-stage builds
- Azure Container Apps deployment infrastructure
- GitHub Actions CI/CD workflows
- Fabric REST API provisioning scripts
- Comprehensive documentation and contributing guidelines

### Infrastructure
- Azure Container Apps environment with auto-scaling
- Azure Container Registry with managed identity authentication
- Log Analytics workspace for monitoring and diagnostics
- User-assigned managed identity for secure Azure service communication
- Fabric workspace, eventstream, eventhouse, and activator resources

### Features
- HTTP server with `/health` and `/ingest` endpoints
- Azure AD authentication for Fabric API access
- Extensible MCP plugin architecture
- Telemetry data normalization and validation
- Configurable logging with multiple levels
- Environment-based configuration management

### Documentation
- Detailed README with setup instructions
- Contributing guidelines for open source collaboration
- MIT license for open source distribution
- API reference documentation
- Troubleshooting guides and common solutions

## [1.0.0] - 2025-01-15

### Added
- Initial release of Microsoft Fabric RTI + MCP Telemetry Client
- Complete infrastructure as code solution
- Production-ready container deployment
- Automated CI/CD pipelines
- Open source licensing and documentation

---

## Release Notes Template

When creating a new release, use this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```
