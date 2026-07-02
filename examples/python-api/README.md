# Example: Python FastAPI Project

This example shows a typical Niyam configuration for a Python API service.

## Stack

- **Python** with FastAPI for the web framework
- **Docker** for containerization and deployment

## Focus

Security-first principles with TDD ensure the API is robust and hardened against common vulnerabilities. The security role adds OWASP guidelines and input validation rules.

## Usage

```bash
cd your-fastapi-project
niyam init --tool claude-code
niyam add --stack docker --principle security-first
```

This generates a `CLAUDE.md` configured for backend security work with testing and deployment workflows.
