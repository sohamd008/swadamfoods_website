import { getDB } from "@/lib/db"
import { jsonResponse as json } from "@/lib/api"

export const dynamic = "force-dynamic"

type InventoryRow = {
  product_id: string
  stock: number
}

export async function GET() {
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
