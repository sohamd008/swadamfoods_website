import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

export function getInventoryDB(): D1Database | undefined {
  try {
    const { env } = getCloudflareContext()
    return (env as unknown as { INVENTORY_DB?: D1Database })?.INVENTORY_DB
  } catch {
    return undefined
  }
}
