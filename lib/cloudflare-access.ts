import { getCloudflareContext } from "@opennextjs/cloudflare"

type AccessEnvironment = {
  CF_ACCESS_TEAM_DOMAIN?: string
  CF_ACCESS_AUD?: string
  CF_ACCESS_ALLOWED_EMAILS?: string
}

type AccessResult =
  | { ok: true; email: string; reason: "authorized" }
  | { ok: false; reason: "not_configured" | "missing_token" | "invalid_token" }

type AccessJwtHeader = { alg?: string; kid?: string; typ?: string }
type AccessJwtPayload = {
  aud?: string | string[]
  exp?: number
  iat?: number
  nbf?: number
  iss?: string
  email?: string
}

let keyCache: { expiresAt: number; keys: JsonWebKey[] } | null = null

function getAccessEnvironment(): AccessEnvironment {
  let runtime: AccessEnvironment = {}
  try {
    const context = getCloudflareContext()
    runtime = (context.env ?? {}) as AccessEnvironment
  } catch {
    runtime = {}
  }

  return {
    CF_ACCESS_TEAM_DOMAIN: runtime.CF_ACCESS_TEAM_DOMAIN ?? process.env.CF_ACCESS_TEAM_DOMAIN,
    CF_ACCESS_AUD: runtime.CF_ACCESS_AUD ?? process.env.CF_ACCESS_AUD,
    CF_ACCESS_ALLOWED_EMAILS: runtime.CF_ACCESS_ALLOWED_EMAILS ?? process.env.CF_ACCESS_ALLOWED_EMAILS,
  }
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function parseJwtPart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T
}

async function getAccessKeys(teamDomain: string): Promise<JsonWebKey[]> {
  if (keyCache && keyCache.expiresAt > Date.now()) return keyCache.keys

  const response = await fetch("https://" + teamDomain + "/cdn-cgi/access/certs", {
    headers: { accept: "application/json" },
    cache: "no-store",
  })
  if (!response.ok) throw new Error("Cloudflare Access certificates could not be loaded.")

  const body = (await response.json()) as { keys?: JsonWebKey[] }
  if (!Array.isArray(body.keys) || body.keys.length === 0) {
    throw new Error("Cloudflare Access did not return signing keys.")
  }

  keyCache = { keys: body.keys, expiresAt: Date.now() + 5 * 60 * 1000 }
  return body.keys
}

export async function verifyInventoryAccess(assertion: string | null | undefined): Promise<AccessResult> {
  const config = getAccessEnvironment()
  const teamDomain = (config.CF_ACCESS_TEAM_DOMAIN ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "")
  const audiences = (config.CF_ACCESS_AUD ?? "").split(",").map((value) => value.trim()).filter(Boolean)

  if (!teamDomain || !audiences.length) return { ok: false, reason: "not_configured" }
  if (!assertion || assertion.length > 16000) return { ok: false, reason: "missing_token" }

  try {
    const parts = assertion.split(".")
    if (parts.length !== 3) return { ok: false, reason: "invalid_token" }

    const header = parseJwtPart<AccessJwtHeader>(parts[0])
    const payload = parseJwtPart<AccessJwtPayload>(parts[1])
    if (header.alg !== "RS256" || !header.kid) return { ok: false, reason: "invalid_token" }

    const now = Math.floor(Date.now() / 1000)
    if (
      typeof payload.exp !== "number" ||
      payload.exp <= now ||
      (typeof payload.nbf === "number" && payload.nbf > now + 30) ||
      payload.iss !== "https://" + teamDomain
    ) {
      return { ok: false, reason: "invalid_token" }
    }

    const tokenAudiences = Array.isArray(payload.aud)
      ? payload.aud
      : typeof payload.aud === "string"
        ? [payload.aud]
        : []
    if (!audiences.some((audience) => tokenAudiences.includes(audience))) {
      return { ok: false, reason: "invalid_token" }
    }

    const email = (payload.email ?? "").trim().toLowerCase()
    if (!email || !email.includes("@")) return { ok: false, reason: "invalid_token" }

    const allowedEmails = (config.CF_ACCESS_ALLOWED_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
    if (allowedEmails.length && !allowedEmails.includes(email)) {
      return { ok: false, reason: "invalid_token" }
    }

    const keys = await getAccessKeys(teamDomain)
    const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA")
    if (!jwk) return { ok: false, reason: "invalid_token" }

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    )
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(parts[0] + "." + parts[1]),
    )
    return valid ? { ok: true, email, reason: "authorized" } : { ok: false, reason: "invalid_token" }
  } catch {
    return { ok: false, reason: "invalid_token" }
  }
}
