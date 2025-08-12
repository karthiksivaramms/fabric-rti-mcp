# Security Policy

## Supported Versions

We actively support the following versions of this project:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 📧 Contact Information

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:
- **Email**: [Replace with your security email]
- **Subject**: "Security Vulnerability in fabric-rti-mcp"

### 📋 Information to Include

When reporting a vulnerability, please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and attack scenarios
3. **Reproduction**: Step-by-step instructions to reproduce the issue
4. **Environment**: Affected versions, operating systems, configurations
5. **Proof of Concept**: Code or screenshots demonstrating the vulnerability (if applicable)

### ⏱️ Response Timeline

We will respond to security reports according to the following timeline:

- **Initial Response**: Within 48 hours
- **Assessment**: Within 5 business days
- **Fix Development**: Depends on severity and complexity
- **Public Disclosure**: After fix is deployed and users have time to update

### 🔒 Security Measures

This project implements several security measures:

#### Infrastructure Security
- **Azure Managed Identity**: Eliminates the need for stored credentials
- **HTTPS Only**: All HTTP endpoints require TLS encryption
- **Network Security**: Container Apps run in secure environments
- **Resource Isolation**: Proper Azure RBAC and resource scoping

#### Application Security
- **Input Validation**: All HTTP inputs are validated and sanitized
- **Azure AD Authentication**: Secure token-based authentication
- **Environment Variables**: Sensitive configuration stored securely
- **Dependency Scanning**: Regular security updates for dependencies

#### CI/CD Security
- **OIDC Authentication**: GitHub Actions use federated identity
- **Secret Management**: GitHub Secrets for sensitive configuration
- **Container Scanning**: Docker images scanned for vulnerabilities
- **Signed Commits**: Encourage signed commits for code integrity

### 🛡️ Security Best Practices for Users

When using this project:

#### Deployment Security
1. **Use Latest Version**: Always deploy the latest stable version
2. **Secure Secrets**: Never commit credentials to version control
3. **Network Security**: Configure appropriate firewall rules
4. **Monitor Access**: Enable Azure Monitor and log analytics
5. **Regular Updates**: Keep all dependencies and base images updated

#### Configuration Security
1. **Principle of Least Privilege**: Grant minimal required permissions
2. **Rotate Credentials**: Regularly rotate any long-lived secrets
3. **Secure Endpoints**: Use authentication for all public endpoints
4. **Environment Separation**: Use separate environments for dev/staging/prod

#### Operational Security
1. **Monitor Logs**: Regularly review application and security logs
2. **Incident Response**: Have a plan for security incident response
3. **Backup and Recovery**: Maintain secure backups of critical data
4. **Security Testing**: Include security testing in your CI/CD pipeline

### 🔍 Known Security Considerations

#### Current Limitations
- **Fabric API Access**: Requires appropriate Fabric licensing and permissions
- **Container Security**: Relies on Azure Container Apps security model
- **Data in Transit**: Ensure Eventstream connections use encryption
- **Access Control**: Configure Fabric workspace permissions appropriately

#### Mitigation Strategies
- Use Azure AD conditional access policies
- Implement network security groups where applicable
- Enable Azure Security Center recommendations
- Regular security assessments and penetration testing

### 📊 Security Reporting

We maintain transparency about security through:

1. **Security Advisories**: Published through GitHub Security Advisories
2. **CVE Database**: Register significant vulnerabilities in CVE database
3. **Security Changelog**: Document security fixes in CHANGELOG.md
4. **Dependency Updates**: Regular updates documented in release notes

### 🎯 Scope

This security policy covers:

- **Core Application Code**: Node.js telemetry ingestor
- **Infrastructure Templates**: Bicep templates and configurations
- **CI/CD Pipelines**: GitHub Actions workflows
- **Documentation**: Security-related documentation
- **Dependencies**: Third-party packages and base images

### ❌ Out of Scope

The following are outside our security scope:

- **Microsoft Fabric Platform**: Security of the underlying Fabric service
- **Azure Platform**: Security of Azure infrastructure services
- **Third-party Integrations**: MCP client implementations by others
- **User Environments**: Security of user's specific deployment environments

### 🏆 Recognition

We appreciate security researchers and will:

- **Acknowledge Contributors**: Credit researchers in security advisories (with permission)
- **Response Communication**: Keep researchers updated on fix progress
- **Coordination**: Work together on responsible disclosure timelines

### 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Azure Security Best Practices](https://docs.microsoft.com/en-us/azure/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Container Security Best Practices](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-image-security)

---

**Thank you for helping keep this project and its users safe!** 🔒
