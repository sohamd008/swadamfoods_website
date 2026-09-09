import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

export const dynamic = "force-dynamic"

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

type InventoryRow = {
  product_id: string
  stock: number
}

function getCF() {
  try {
    const { env } = getCloudflareContext()
    const db = (env as unknown as { DB?: D1Database })?.DB
    return { db }
  } catch {
    return { db: undefined }
  }
}

export async function GET() {
  const { db } = getCF()

  if (!db || typeof db.prepare !== "function") {
    return json({ inventory: [] })
  }

  try {
    const result = await db
      .prepare("SELECT product_id, stock FROM product_inventory")
      .all<InventoryRow>()

    return json({
      inventory: (result.results ?? []).map((r) => ({
        productId: r.product_id,
        stock: r.stock,
      })),
    })
  } catch {
    return json({ inventory: [] })
  }
}
