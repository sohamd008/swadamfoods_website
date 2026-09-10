import { getDB } from "@/lib/db"
import { jsonResponse as json, verifyAdminKey } from "@/lib/api"

export const dynamic = "force-dynamic"

type InventoryRow = {
  product_id: string
  stock: number
}

export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return json({ error: "Unauthorized." }, 401)
  }

  const db = getDB()

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

export async function PATCH(request: Request) {
  if (!verifyAdminKey(request)) {
    return json({ error: "Unauthorized." }, 401)
  }

  const db = getDB()

  let body: { productId?: unknown; stock?: unknown }
  try {
    body = (await request.json()) as { productId?: unknown; stock?: unknown }
  } catch {
    return json({ error: "Invalid JSON." }, 400)
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : ""
  const stock = typeof body.stock === "number" ? Math.max(0, Math.floor(body.stock)) : -1

  if (!productId || stock < 0) {
    return json({ error: "Invalid productId or stock value." }, 400)
  }

  if (!db || typeof db.prepare !== "function") {
    return json({ success: true, productId, stock })
  }

  try {
    await db
      .prepare(
        `INSERT INTO product_inventory (product_id, stock, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(product_id) DO UPDATE SET stock = excluded.stock, updated_at = excluded.updated_at`,
      )
      .bind(productId, stock)
      .run()

    return json({ success: true, productId, stock })
  } catch {
    return json({ error: "Database error." }, 500)
  }
}
