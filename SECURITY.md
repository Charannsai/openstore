# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of OpenStore seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report them via one of the following methods:

1. **Email**: Send a detailed report to **openstore@proton.me**
2. **GitHub Private Reporting**: Use [GitHub's private vulnerability reporting](https://github.com/Charannsai/openstore/security/advisories/new)

### What to Include

Please include the following in your report:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Impact assessment** — what could an attacker do?
- **Affected versions** of OpenStore
- **Any potential fixes** you've identified (optional but appreciated)

### What to Expect

- **Acknowledgment**: We will acknowledge your report within **48 hours**
- **Assessment**: We will assess the vulnerability and determine its severity within **5 business days**
- **Fix timeline**: Critical vulnerabilities will be patched within **7 days**; others within **30 days**
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Scope

The following are in scope for security reports:

- The OpenStore desktop application (Electron)
- The OpenStore web interface (Next.js)
- IPC handlers and system-level operations
- Data handling and local storage
- Dependency vulnerabilities that affect OpenStore directly

### Out of Scope

- Vulnerabilities in third-party dependencies that don't affect OpenStore
- Social engineering attacks
- Denial of service attacks
- Issues that require physical access to a user's device

## Security Best Practices for Contributors

When contributing to OpenStore, please follow these security practices:

1. **Never commit secrets** — Use environment variables and `.env` files (excluded via `.gitignore`)
2. **Validate all inputs** — Especially in IPC handlers that execute system commands
3. **Use parameterized commands** — Never interpolate user input into shell commands
4. **Keep dependencies updated** — Run `npm audit` regularly
5. **Follow the principle of least privilege** — Request only necessary permissions
