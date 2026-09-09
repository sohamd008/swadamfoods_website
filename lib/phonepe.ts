import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

const PHONEPE_API_BASE = "https://api.phonepe.com/apis/pg"
const PHONEPE_IDENTITY_BASE = "https://api.phonepe.com/apis/identity-manager"
const PHONEPE_WEBHOOK_ID = "CF2609082315296637133700"
const PAYMENT_EXPIRY_SECONDS = 1800

let cachedToken: { token: string; expiresAt: number } | null = null

type PhonePeTokenResponse = {
  access_token?: string
  expires_at?: number
  expires_in?: number
  token_type?: string
}

type PhonePePaymentResponse = {
  orderId?: string
  state?: string
  expireAt?: number
  redirectUrl?: string
  code?: string
  message?: string
}

type PhonePeStatusResponse = {
  orderId?: string
  state?: string
  amount?: number
  expireAt?: number
  paymentDetails?: Array<{
    transactionId?: string
    amount?: number
    state?: string
    paymentMode?: string
  }>
  code?: string
  message?: string
}

type PhonePeEnv = CloudflareEnv & {
  DB: D1Database
  PHONEPE_CLIENT_ID?: string
  PHONEPE_CLIENT_SECRET?: string
  PHONEPE_CLIENT_VERSION?: string
  PHONEPE_WEBHOOK_SECRET?: string
}

function getEnv() {
  return getCloudflareContext().env as PhonePeEnv
}

function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing ${name}.`)
  return value
}

async function fetchJson<T>(input: RequestInfo | URL, init: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  let response: Response
  try {
    response = await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  const text = await response.text()
  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`PhonePe returned an invalid response (${response.status}).`)
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message ?? "")
        : ""
    throw new Error(message || `PhonePe request failed (${response.status}).`)
  }

  return data as T
}

export async function getPhonePeAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now()
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token
  }

  const env = getEnv()
  const clientId = required(env.PHONEPE_CLIENT_ID, "PHONEPE_CLIENT_ID")
  const clientSecret = required(env.PHONEPE_CLIENT_SECRET, "PHONEPE_CLIENT_SECRET")
  const clientVersion = required(env.PHONEPE_CLIENT_VERSION, "PHONEPE_CLIENT_VERSION")

  const form = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  })

  const token = await fetchJson<PhonePeTokenResponse>(
    `${PHONEPE_IDENTITY_BASE}/v1/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    },
  )

  if (!token.access_token) throw new Error("PhonePe did not return an access token.")

  let expiryEpochMs = now + 3600 * 1000
  if (typeof token.expires_at === "number") {
    expiryEpochMs = token.expires_at < 10000000000 ? token.expires_at * 1000 : token.expires_at
  } else if (typeof token.expires_in === "number") {
    expiryEpochMs = now + token.expires_in * 1000
  }

  cachedToken = {
    token: token.access_token,
    expiresAt: expiryEpochMs,
  }

  return cachedToken.token
}

export async function createPhonePePayment(params: {
  merchantOrderId: string
  orderId?: string
  amountInRupees: number
  phone: string
}) {
  const token = await getPhonePeAccessToken()
  const origin = "https://swadamfoods.eu.cc"
  const cleanOrderId = params.orderId || params.merchantOrderId

  const digits = params.phone.replace(/\D/g, "")
  const cleanPhone = digits.length >= 10 ? digits.slice(-10) : ""

  const body: Record<string, unknown> = {
    merchantOrderId: params.merchantOrderId,
    amount: Math.round(params.amountInRupees * 100),
    expireAfter: PAYMENT_EXPIRY_SECONDS,
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl: `${origin}/checkout?payment=phonepe&orderId=${encodeURIComponent(cleanOrderId)}`,
      },
    },
  }

  if (cleanPhone.length === 10) {
    body.prefillUserLoginDetails = {
      phoneNumber: cleanPhone,
    }
  }

  return fetchJson<PhonePePaymentResponse>(`${PHONEPE_API_BASE}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
}

export async function getPhonePeOrderStatus(merchantOrderId: string) {
  let token = await getPhonePeAccessToken()
  const url = `${PHONEPE_API_BASE}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false&errorContext=true`

  try {
    return await fetchJson<PhonePeStatusResponse>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
      token = await getPhonePeAccessToken(true)
      return fetchJson<PhonePeStatusResponse>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      })
    }
    throw error
  }
}

export async function verifyPhonePeWebhook(rawBody: string, headers: Headers) {
  const env = getEnv()
  const secret = required(env.PHONEPE_WEBHOOK_SECRET, "PHONEPE_WEBHOOK_SECRET")
  const keyId = headers.get("x-phonepe-checksum-key-id")?.trim()
  const signature = (
    headers.get("x-phonepe-checksum-signature") ??
    headers.get("phonepe-checksum-signature") ??
    headers.get("x-phonepe-checksum")
  )?.trim()

  if (!keyId || keyId !== PHONEPE_WEBHOOK_ID || !signature) return false

  const secretKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const digest = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    new TextEncoder().encode(rawBody),
  )
  const expected = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")

  return timingSafeEqual(expected, signature.toLowerCase())
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export { PAYMENT_EXPIRY_SECONDS, PHONEPE_WEBHOOK_ID }
