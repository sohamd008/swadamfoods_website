# Auth.md

> Agent registration metadata for Swadam Foods (`swadamfoods.eu.cc`).
> Public catalog & machine discovery. No user accounts. Credentials are optional and attribute correspondence.
> Operator contact: <mailto:swadamfoodsindia@gmail.com>.

## Agent registration

Swadam Foods publishes public machine-readable metadata and catalog information for AI agents.
The public catalog endpoints do not require credentials:
- `GET https://swadamfoods.eu.cc/api/products`
- `GET https://swadamfoods.eu.cc/api/status`

This document describes how an operator can register an agent identity, discover protected resource metadata, and correspond with Swadam Foods.

Both resource and authorization server roles reside on this host:
- Resource Server: `https://swadamfoods.eu.cc`
- Authorization Server: `https://swadamfoods.eu.cc`

## Discovery

AI agents should read discovery documents in the following order:

1. Fetch `https://swadamfoods.eu.cc/.well-known/oauth-protected-resource` for resource metadata, authorization servers, and supported scopes (`read:products`, `create:orders`).
2. Fetch `https://swadamfoods.eu.cc/.well-known/oauth-authorization-server` for agent authentication parameters, register URI, claim URI, and identity types.
3. Fetch `https://swadamfoods.eu.cc/.well-known/openid-configuration` for OpenID Connect configuration.

## Identity & Operator

- Operator: DANDEKAR VIDYA AJIT (Proprietorship)
- Brand: Swadam Foods
- Location: Pune, Maharashtra, India
- Registration: FSSAI License `21526080002094`, UDYAM `UDYAM-MH-26-1188295`
- Official Contact: <mailto:swadamfoodsindia@gmail.com>
- WhatsApp Business: +91 88888 51522

## Supported Identity Types

- `anonymous`: No registration required. Every catalog resource is public read-only.
- `identity_assertion`: Registered operator or agent identity backed by a verified email or signed assertion (`urn:ietf:params:oauth:token-type:id-jag`, `verified_email`).

## Registration

Registration is handled asynchronously via email to <mailto:swadamfoodsindia@gmail.com?subject=Agent%20Registration> or via JSON at `https://swadamfoods.eu.cc/api/agent/register`:

- Agent identifier and software model
- Operator name and organization
- Purpose of access (catalog indexing, order assistance, shopping concierge)
- Expected request rate

## Scopes

- `read:products`: Public read-only catalog access.
- `create:orders`: Order generation and checkout initiation.

## Related Discovery Documents

- API Catalog: `https://swadamfoods.eu.cc/.well-known/api-catalog`
- MCP Server Card: `https://swadamfoods.eu.cc/.well-known/mcp/server-card.json`
- Agent Skills: `https://swadamfoods.eu.cc/.well-known/agent-skills/index.json`
- Universal Commerce Protocol: `https://swadamfoods.eu.cc/.well-known/ucp`
- Agentic Commerce Protocol: `https://swadamfoods.eu.cc/.well-known/acp.json`
- OpenAPI Specification: `https://swadamfoods.eu.cc/openapi.json`
- Machine Payment Protocol (MPP): `https://swadamfoods.eu.cc/openapi.json`
- x402 Protocol: `https://swadamfoods.eu.cc/.well-known/x402`
