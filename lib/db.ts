import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

export function getDB(): D1Database | undefined {
  try {
    const { env } = getCloudflareContext()
    return (env as unknown as { DB?: D1Database })?.DB
  } catch {
    return undefined
  }
}
