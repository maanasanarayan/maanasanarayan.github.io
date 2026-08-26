---
title: 'Developer Portal & API Docs'
description: "API endpoints, OpenAPI 3.1.0 specifications, MCP server discovery, and authentication guides for Maanasa Narayan's developer platform."
canonical: 'https://maanasa.dev/developers'
last-updated: '2026-08-25'
---

## Maanasa Narayan Developer Portal & API Docs

Welcome to the programmatic interface for Maanasa Narayan's developer platform. AI agents, autonomous clients, and developers can interact with verified skills, experience, and documentation.

## Quickstart Protocols

- **NLWeb Natural Language Query:** `POST https://maanasa.dev/ask` (Streams answers via SSE).
- **Model Context Protocol (MCP):** Connect to `https://maanasa.dev/.well-known/mcp/server-card.json` or `https://maanasa.dev/.well-known/mcp/docs-server-card.json`.
- **OpenAPI 3.1.0 Specification:** `https://maanasa.dev/api/openapi.json`.
- **RFC 9727 API Catalog:** `https://maanasa.dev/.well-known/api-catalog`.
- **Agent Authentication Guide:** `https://maanasa.dev/auth.md`.

## REST API Endpoints

- `GET /v1/profile` — Verified profile summary and employment details.
- `GET /v1/experience` — Paginated work history across Google, Kayak, Amazon, Nokia, and Adobe.
- `GET /v1/skills` — Categorised technical skills stack.
- `GET /v1/projects` — Paginated list of software engineering and cloud projects.
- `POST /v1/agent/register` — WorkOS auth.md agent registration.
- `POST /v1/jobs` — Asynchronous job creation.
- `POST /v1/batch` — Batch execution of read operations.

## Interactive Sandbox

- **Sandbox URL:** `https://sandbox.maanasa.dev` or `https://maanasa.dev/?mode=agent`
- **Mock Token:** `test_token_sandbox_agent_2026`
- **Rate Limit:** 100 requests/minute per client IP (RateLimit headers returned).
