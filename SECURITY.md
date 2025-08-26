# Security Policy

## Supported Versions

As Obsidian Operator is currently in early development, security updates will be applied to the latest version only.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously.
If you discover a security vulnerability in Obsidian Operator, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities.
2. Instead, please report security vulnerabilities via GitHub's Security Advisory feature:
   - Navigate to the Security tab of this repository
   - Click "Report a vulnerability"
   - Provide a detailed description of the vulnerability
3. Alternatively, you can email security concerns directly to the repository owner.

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any proof-of-concept code (if applicable)
- Your suggested fix (if you have one)

### Response Timeline

- We will acknowledge receipt of your report within 48 hours
- We will provide an initial assessment within 7 days
- We will work on a fix and coordinate disclosure timing with you

## Security Best Practices for Contributors

When contributing to Obsidian Operator:

1. **Never commit secrets**: API keys, tokens, or credentials should never be committed to the repository
2. **Validate inputs**: Especially important for voice command processing
3. **Sanitize outputs**: Ensure transcribed text is properly escaped when displayed
4. **API security**: Use secure methods for API communication
5. **Dependencies**: Keep dependencies up to date (managed via Renovatebot)

## Scope

Given that this plugin handles voice transcription and may interact with external APIs:

- **In scope**: Vulnerabilities in the plugin code, API integrations, file handling
- **Out of scope**: Vulnerabilities in Obsidian itself, third-party API services

Thank you for helping keep Obsidian Operator secure!