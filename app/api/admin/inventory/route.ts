import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDB } from "@/lib/db"
import { jsonResponse as json } from "@/lib/api"

export const dynamic = "force-dynamic"

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function verifyAdminKey(request: Request): boolean {
  let adminKey = process.env.ADMIN_SECRET_KEY
  try {
    const { env } = getCloudflareContext()
    adminKey = (env as unknown as { ADMIN_SECRET_KEY?: string })?.ADMIN_SECRET_KEY || adminKey
  } catch {}
  if (!adminKey) return false
  const headerKey = request.headers.get("x-admin-key")?.trim()
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "").trim()
  const urlKey = new URL(request.url).searchParams.get("key")?.trim()
  return (
    (headerKey ? timingSafeEqual(headerKey, adminKey) : false) ||
    (authHeader ? timingSafeEqual(authHeader, adminKey) : false) ||
    (urlKey ? timingSafeEqual(urlKey, adminKey) : false)
  )
}

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
