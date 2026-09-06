# Swadam Foods agent authentication

## Authentication

Swadam Foods' public product catalog is read-only and does not require authentication or an API key.

The catalog endpoints are:

- `GET https://swadamfoods.eu.cc/api/products`
- `GET https://swadamfoods.eu.cc/api/status`

## Ordering

Product orders are handled directly by Swadam Foods through WhatsApp. This is a human-facing ordering channel and is not an authenticated API.

No OAuth 2.0 or OpenID Connect authorization server is currently required for the public catalog.
