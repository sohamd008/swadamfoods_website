import { getDB } from "@/lib/db"
import { jsonResponse as json, verifyAdminKey } from "@/lib/api"
import { products } from "@/lib/products"

export const dynamic = "force-dynamic"

type InventoryRow = {
  product_id: string
  stock: number
}

const PRODUCT_IDS = new Set(products.map((product) => product.id))

export async function GET(request: Request) {
  if (!verifyAdminKey(request)) return json({ error: "Unauthorized." }, 401)

  const db = getDB()
  if (!db) return json({ error: "Database temporarily unavailable." }, 503)

  try {
    const result = await db.prepare("SELECT product_id, stock FROM product_inventory ORDER BY product_id").all<InventoryRow>()
    return json({
      inventory: (result.results ?? []).map((row) => ({ productId: row.product_id, stock: row.stock })),
    })
  } catch (error) {
    console.error("Failed to fetch inventory:", error)
    return json({ error: "Failed to load inventory." }, 500)
  }
}

export async function PATCH(request: Request) {
  if (!verifyAdminKey(request)) return json({ error: "Unauthorized." }, 401)

  const db = getDB()
  if (!db) return json({ error: "Database temporarily unavailable." }, 503)

  let body: { productId?: unknown; stock?: unknown }
  try {
    body = (await request.json()) as { productId?: unknown; stock?: unknown }
  } catch {
    return json({ error: "Invalid JSON." }, 400)
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : ""
  const stock = typeof body.stock === "number" ? Math.floor(body.stock) : -1

  if (!PRODUCT_IDS.has(productId) || !Number.isSafeInteger(stock) || stock < 0) {
    return json({ error: "Invalid productId or stock value." }, 400)
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
  } catch (error) {
    console.error("Failed to update inventory:", error)
    return json({ error: "Database error." }, 500)
  }
}
