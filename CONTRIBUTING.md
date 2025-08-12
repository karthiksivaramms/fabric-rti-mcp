# Contributing to Microsoft Fabric RTI + MCP Telemetry Client

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Environment details (OS, Node.js version, Azure region)
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs or screenshots

### Suggesting Features

1. **Check existing feature requests** in Issues
2. **Create a detailed proposal** including:
   - Use case and problem description
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Test thoroughly** (see Testing section below)
5. **Commit with clear messages** following [Conventional Commits](https://www.conventionalcommits.org/)
6. **Submit a pull request**

## 📋 Development Guidelines

### Code Style

**JavaScript/Node.js:**
- Use ESLint configuration (`.eslintrc.js`)
- Follow Prettier formatting
- Use JSDoc comments for all functions
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises where possible

**Bicep:**
- Use consistent parameter naming (camelCase)
- Include descriptions for all parameters
- Use resource naming conventions
- Add tags for resource management
- Include outputs for important resource IDs

**Documentation:**
- Use clear, concise language
- Include code examples where applicable
- Update README.md for significant changes
- Add inline comments for complex logic

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ingestor): add support for batch telemetry ingestion
fix(auth): resolve Azure AD token refresh issue
docs(readme): update deployment instructions
```

## 🧪 Testing

### Local Testing

**Node.js Application:**
```bash
cd app/telemetry-ingestor
npm install
npm test
npm run lint
```

**Infrastructure:**
```bash
# Validate Bicep templates
az bicep build --file infra/main.bicep
az bicep build --file infra/container.bicep

# What-if deployment
az deployment group what-if \
  --resource-group rg-test \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json
```

### Integration Testing

1. **Deploy to test environment**
2. **Test all HTTP endpoints**
3. **Verify telemetry data flow**
4. **Check Azure Monitor logs**

### Required Tests

Before submitting a PR, ensure:
- [ ] All existing tests pass
- [ ] New features include unit tests
- [ ] Integration tests pass
- [ ] Bicep templates validate successfully
- [ ] Documentation is updated

## 🏗️ Project Structure

### Key Files and Directories

```
fabric-rti-mcp/
├── 📂 app/telemetry-ingestor/
│   ├── src/
│   │   ├── index.js          # Main HTTP server
│   │   ├── auth.js           # Azure AD authentication
│   │   ├── mcp-client.js     # MCP plugin loader
│   │   └── telemetry.js      # Telemetry normalization
│   ├── tests/                # Unit tests
│   ├── Dockerfile            # Container definition
│   └── package.json          # Dependencies
├── 📂 infra/
│   ├── main.bicep           # Fabric RTI resources
│   ├── container.bicep      # Container Apps infrastructure
│   └── *.parameters.json    # Environment parameters
├── 📂 .github/workflows/
│   └── *.yml                # CI/CD pipelines
└── 📂 tools/fabric-provision/
    └── index.js             # Fabric REST API scripts
```

### Adding New Features

**For Node.js application:**
1. Add feature code in appropriate `src/` file
2. Create corresponding test file in `tests/`
3. Update `package.json` if new dependencies are added
4. Update environment variables in `.env.example`

**For Infrastructure:**
1. Add Bicep resources in appropriate template
2. Update parameter files with new parameters
3. Test deployment in isolated environment
4. Update documentation

**For CI/CD:**
1. Test workflow changes in fork first
2. Ensure secrets and variables are documented
3. Add appropriate error handling
4. Update workflow documentation

## 🔍 Code Review Process

### Pull Request Guidelines

1. **Use descriptive PR titles** following conventional commit format
2. **Provide detailed description** including:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots (if UI-related)
3. **Link related issues** using keywords (fixes #123)
4. **Keep PRs focused** - one feature/fix per PR
5. **Update documentation** as needed

### Review Criteria

Reviewers will check for:
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

## 🛡️ Security

### Reporting Security Issues

**Do not report security vulnerabilities in public issues.**

Instead:
1. Email: [security@yourproject.com] (replace with actual email)
2. Include detailed description
3. Provide steps to reproduce
4. Include potential impact assessment

### Security Guidelines

- **Never commit secrets** (API keys, passwords, tokens)
- **Use Azure Managed Identity** where possible
- **Validate all inputs** in HTTP endpoints
- **Follow OWASP best practices**
- **Keep dependencies updated**

## 📦 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with new features/fixes
3. **Create release tag**: `git tag v1.2.3`
4. **Push tag**: `git push origin v1.2.3`
5. **GitHub Actions** will automatically build and deploy

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- [ ] Additional MCP plugin examples
- [ ] Enhanced error handling and retry logic
- [ ] Performance optimizations
- [ ] Integration tests for Fabric APIs
- [ ] Terraform alternative to Bicep

### Medium Priority
- [ ] Batch ingestion support
- [ ] Metrics and monitoring dashboards
- [ ] Additional authentication methods
- [ ] Data validation schemas
- [ ] Load testing scripts

### Documentation
- [ ] API documentation improvements
- [ ] Deployment tutorials
- [ ] Troubleshooting guides
- [ ] Architecture decision records
- [ ] Video tutorials

## 🌟 Recognition

Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Acknowledged in documentation**

## 📞 Getting Help

If you need help contributing:

1. **Check existing documentation**
2. **Search closed issues** for similar problems
3. **Ask in Discussions** for general questions
4. **Create an issue** for specific problems

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🚀
