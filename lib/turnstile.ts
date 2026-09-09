export type TurnstileVerifyResult = {
  success: boolean
  error?: string
  hostname?: string
  action?: string
}

const DEFAULT_ALLOWED_HOSTNAMES = [
  "swadamfoods.eu.cc",
  "localhost",
  "127.0.0.1",
]

export async function verifyTurnstileToken({
  token,
  secret,
  expectedAction = "checkout",
  remoteIp,
  allowedHostnames,
}: {
  token?: string | null
  secret: string
  expectedAction?: string
  remoteIp?: string | null
  allowedHostnames?: string[]
}): Promise<TurnstileVerifyResult> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { success: false, error: "Missing or invalid Turnstile token." }
  }

  if (!secret) {
    return { success: false, error: "Turnstile secret not configured." }
  }

  const expectedHosts = new Set(
    (allowedHostnames && allowedHostnames.length > 0
      ? allowedHostnames
      : DEFAULT_ALLOWED_HOSTNAMES
    ).map((h) => h.toLowerCase().trim()),
  )

  try {
    const formData = new URLSearchParams()
    formData.append("secret", secret)
    formData.append("response", token)
    if (remoteIp) {
      formData.append("remoteip", remoteIp)
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!res.ok) {
      return { success: false, error: `Turnstile API error (${res.status}).` }
    }

    const data = (await res.json()) as {
      success: boolean
      "error-codes"?: string[]
      challenge_ts?: string
      hostname?: string
      action?: string
      cdata?: string
    }

    if (!data.success) {
      const errCodes = data["error-codes"]?.join(", ") || "verification-failed"
      return { success: false, error: `Turnstile rejected (${errCodes}).` }
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        error: `Turnstile action mismatch: expected ${expectedAction}, got ${data.action}.`,
      }
    }

    if (data.hostname) {
      const host = data.hostname.toLowerCase().trim()
      const isAllowed =
        expectedHosts.has(host) ||
        host.endsWith(".pages.dev") ||
        host.endsWith(".workers.dev")

      if (!isAllowed) {
        return {
          success: false,
          error: `Turnstile hostname ${data.hostname} is not allowed.`,
        }
      }
    }

    return {
      success: true,
      hostname: data.hostname,
      action: data.action,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification request failed"
    return { success: false, error: message }
  }
}
