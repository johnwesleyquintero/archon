# GitHub Actions Configuration

## Overview

This directory contains GitHub Actions workflows and configuration files for the Archon project. The workflows are designed to automate various tasks such as dependency scanning, testing, and deployment.

## Workflows

### Dependency Scanning (`workflows/dependency-scan.yml`)

This workflow scans the project dependencies for vulnerabilities using npm audit and Snyk.

- **Trigger**: Runs on push to main, pull requests to main, and weekly on Mondays
- **Features**:
  - npm audit for production dependencies
  - Snyk vulnerability scanning

## Configuration

### Actions Configuration (`actions-config.yml`)

This file contains configuration settings for GitHub Actions workflows, including:

- **Allowed Secrets**: List of secrets that are explicitly allowed to be used in workflows
- **Suppressed Warnings**: List of warnings that should be suppressed in workflows

## Security Considerations

### Secret Usage

When using secrets in GitHub Actions workflows, follow these best practices:

1. **Explicit Allowance**: Add secrets to the `allowed_secrets` list in `actions-config.yml`
2. **Warning Suppression**: For known safe usages that trigger warnings, add a suppression comment:
   ```yaml
   # github-actions: suppressWarning=context_access_snyk_token
   ```
3. **Minimal Scope**: Only use secrets in the specific steps that require them
4. **Error Handling**: Use `continue-on-error` for steps that might fail due to missing secrets

### SNYK_TOKEN Usage

The `SNYK_TOKEN` is used for vulnerability scanning with Snyk. The warning about context access is suppressed because:

1. The token is used according to Snyk's official documentation
2. The token is only used in the specific step that runs Snyk
3. The workflow has error handling in case the token is not available

## Validation

To validate GitHub Actions workflows against the project's configuration and best practices, run:

```bash
npm run check:actions
```

This script checks for:

- Unauthorized secret usage
- Missing suppression comments for known warnings
- Other best practices defined in the configuration
