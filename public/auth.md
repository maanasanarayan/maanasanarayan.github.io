---
title: 'Agent Authentication Guide (auth.md)'
description: "Step-by-step authentication and credentials walkthrough for AI agents accessing Maanasa Narayan's API surface."
canonical: 'https://maanasa.dev/auth.md'
last-updated: '2026-08-24'
---

## Agent Authentication Guide

This document outlines how autonomous agents, AI assistants, and machine clients authenticate against the `https://maanasa.dev` API surface according to the WorkOS `auth.md` specification.

## Discover

To discover supported authentication methods and endpoints, agents inspect:

- **Protected Resource Metadata (RFC 9728):** `https://maanasa.dev/.well-known/oauth-protected-resource`
- **Authorization Server Metadata (RFC 8414):** `https://maanasa.dev/.well-known/oauth-authorization-server`
- **API Catalog (RFC 9727):** `https://maanasa.dev/.well-known/api-catalog`

When querying protected endpoints without credentials, the server returns an HTTP 401 response carrying a `WWW-Authenticate` header pointing directly to the discovery document:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://maanasa.dev/.well-known/oauth-protected-resource"
```

The RFC 8414 metadata publishes the `agent_auth` block advertising the `register_uri`, `claim_uri`, and `revocation_uri`.

## Pick a method

Agents may authenticate using one of the following methods:

1. **Anonymous / Public Access:** Read-only access for portfolio querying, NLWeb queries (`/ask`), and MCP discovery. No interactive registration required.
2. **Identity Assertion (`identity_assertion`):** Agents presenting a cryptographic token or software statement (such as `urn:ietf:params:oauth:token-type:id-jag` or verified email claims) can register for higher rate limits.

## Register

To register an agent instance, send a `POST` request to the advertised `register_uri`:

```http
POST https://maanasa.dev/api/agent/register
Content-Type: application/json

{
  "client_name": "ExampleAgent/1.0",
  "identity_type": "identity_assertion",
  "assertion": "<signed-jwt-or-assertion>"
}
```

The registration endpoint responds with client credentials and an expiration timestamp.

## Claim

If authorization requires user consent or credential claim, the agent uses the `claim_uri`:

```http
POST https://maanasa.dev/api/agent/claim
Content-Type: application/json

{
  "claim_token": "ct_123456789",
  "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange"
}
```

## Use the credential

Include the issued token in the standard `Authorization` request header on subsequent API calls:

```http
GET https://maanasa.dev/api/profile
Authorization: Bearer <issued_token>
```

Or for POST requests:

```http
POST https://maanasa.dev/ask
Authorization: Bearer <issued_token>
Content-Type: application/json

{
  "query": "What is Maanasa's experience with distributed systems?"
}
```

## Errors

When an authentication error occurs, responses follow standard RFC 6750 format:

- **401 Unauthorized:** Invalid or expired token. The response includes `WWW-Authenticate: Bearer error="invalid_token"`.
- **403 Forbidden:** The authenticated token lacks required scopes (`read:profile`, `ask:question`).
- **400 Bad Request:** Malformed assertion or unknown `agent_auth` parameters.

## Revocation

To revoke an active token, invoke the `revocation_uri`:

```http
POST https://maanasa.dev/api/agent/revoke
Content-Type: application/json

{
  "token": "<token_to_revoke>"
}
```

## Sandbox Environment

Agents can test authentication flows and API integrations against our sandbox environment at:

- Sandbox URL: `https://sandbox.maanasa.dev`
- Mock Token: `test_token_sandbox_agent_2026`
