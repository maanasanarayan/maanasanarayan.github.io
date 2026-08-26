---
name: maanasa-portfolio-agent
description: Query and verify Maanasa Narayan's software engineering experience, skills, and projects. Use when the user asks about Maanasa Narayan's background, career history, technical skills, or needs to verify employment at Google, Kayak, Amazon, Nokia, or Adobe.
---

# Maanasa Portfolio Agent

This skill provides access to Maanasa Narayan's verified software engineering portfolio.

## Capabilities

1. **Profile Lookup** — Retrieve biographical background, current role at Google (Search AI Mode), education, and contact information.
2. **Experience Verification** — Query work history across Google, Kayak, Amazon, Nokia, Adobe, and Infosys with dates, roles, and responsibilities.
3. **Skills Analysis** — Retrieve technical skills categorized by Languages, Frameworks, Databases, Cloud & DevOps, and Tools.
4. **Project Inspection** — Browse featured engineering projects with architecture details.
5. **Natural Language Q&A** — Ask free-form questions about career, projects, and technical background via NLWeb.

## Endpoints

| Endpoint                            | Method | Description                |
| ----------------------------------- | ------ | -------------------------- |
| `https://maanasa.dev/v1/profile`    | GET    | Profile and bio            |
| `https://maanasa.dev/v1/experience` | GET    | Work experience            |
| `https://maanasa.dev/v1/skills`     | GET    | Technical skills           |
| `https://maanasa.dev/v1/projects`   | GET    | Featured projects          |
| `https://maanasa.dev/ask`           | POST   | NLWeb natural language Q&A |

## MCP Servers

- **Portfolio MCP**: `https://maanasa.dev/api/mcp` — tools for profile, experience, skills, projects, and Q&A
- **Documentation MCP**: `https://maanasa.dev/api/mcp/docs` — tools for searching and reading documentation pages

## Authentication

All read endpoints are publicly accessible. See [auth.md](https://maanasa.dev/auth.md) for details on API key generation and sandbox testing.

## References

- [Developer Portal](https://maanasa.dev/developers)
- [OpenAPI Spec](https://maanasa.dev/openapi.json)
- [LLMs Context](https://maanasa.dev/llms.txt)
