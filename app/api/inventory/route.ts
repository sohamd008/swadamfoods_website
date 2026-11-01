import { jsonResponse } from "@/lib/api"
import { verifyInventoryAccess } from "@/lib/cloudflare-access"
import { getInventoryDB } from "@/lib/inventory-db"

export const dynamic = "force-dynamic"
export const revalidate = 0

type ProductRow = {
  id: string
  code: string
  name: string
  category: string | null
  description: string | null
  is_active: number
  created_at: string
}

type FinishedStockRow = {
  id: string
  productId: string
  productName: string
  productCode: string
  packSizeG: number
  packetsOnHand: number
  notes: string | null
  updatedBy: string
  updatedAt: string
}

type VendorRow = {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  address: string | null
  notes: string | null
  is_active: number
  created_at: string
}

type MaterialRow = {
  id: string
  code: string
  name: string
  category: string | null
  unit: string
  description: string | null
  is_active: number
  created_at: string
}

type PurchaseLotRow = {
  id: string
  materialId: string
  materialName: string
  unit: string
  vendorId: string
  vendorName: string
  vendorLotNumber: string | null
  invoiceNumber: string | null
  purchasedOn: string
  receivedQty: number
  usedQty: number
  availableQty: number
  unitCost: number | null
  createdAt: string
}

type UsageRow = {
  id: string
  batchId: string
  materialId: string
  materialName: string
  unit: string
  purchaseLotId: string
  vendorId: string
  vendorName: string
  vendorLotNumber: string | null
  invoiceNumber: string | null
  qtyUsed: number
  notes: string | null
}

type BatchRow = {
  id: string
  batchNo: string
  productId: string
  productName: string
  manufacturedOn: string
  outputQtyKg: number
  status: string
  bestBefore: string | null
  operatorName: string | null
  packagingLot: string | null
  notes: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  qcStatus: string | null
  qcRemarks: string | null
  qcCheckedBy: string | null
  qcCheckedAt: string | null
  moisturePct: number | null
}

type ActivityRow = {
  id: string
  actor: string
  action: string
  entityType: string
  entityId: string
  summary: string
  createdAt: string
}

type StatsRow = {
  totalBatches: number
  totalOutputKg: number
  monthBatches: number
  monthOutputKg: number
  qcPending: number
}

function textValue(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function positiveNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z"))
}

function auditStatement(
  db: NonNullable<ReturnType<typeof getInventoryDB>>,
  actor: string,
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
) {
  return db.prepare(
    "INSERT INTO inventory_audit_logs (id, actor, action, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)",
  ).bind(crypto.randomUUID(), actor, action, entityType, entityId, summary.slice(0, 240))
}

async function authorize(request: Request) {
  const result = await verifyInventoryAccess(request.headers.get("cf-access-jwt-assertion"))
  if (!result.ok) {
    const status = result.reason === "not_configured" ? 503 : 401
    return { response: jsonResponse({ error: result.reason === "not_configured" ? "Inventory access is not configured." : "Cloudflare Access authentication required." }, status) }
  }
  return { email: result.email }
}

export async function GET(request: Request) {
  const auth = await authorize(request)
  if ("response" in auth) return auth.response

  const db = getInventoryDB()
  if (!db) return jsonResponse({ error: "Inventory database is not connected. Follow INVENTORY_SETUP.md to create and bind swadam_inventory." }, 503)

  try {
    const [productsResult, finishedStockResult, vendorsResult, materialsResult, lotsResult, batchesResult, usageResult, activityResult, statsResult] = await Promise.all([
      db.prepare("SELECT id, code, name, category, description, is_active, created_at FROM inventory_products ORDER BY name COLLATE NOCASE").all<ProductRow>(),
      db.prepare("SELECT s.id, s.product_id AS productId, p.name AS productName, p.code AS productCode, s.pack_size_g AS packSizeG, s.packets_on_hand AS packetsOnHand, s.notes, s.updated_by AS updatedBy, s.updated_at AS updatedAt FROM inventory_finished_stock s JOIN inventory_products p ON p.id = s.product_id ORDER BY p.name COLLATE NOCASE, s.pack_size_g ASC").all<FinishedStockRow>(),
      db.prepare("SELECT id, name, contact_name, phone, email, gstin, address, notes, is_active, created_at FROM inventory_vendors ORDER BY name COLLATE NOCASE").all<VendorRow>(),
      db.prepare("SELECT id, code, name, category, unit, description, is_active, created_at FROM inventory_materials ORDER BY name COLLATE NOCASE").all<MaterialRow>(),
      db.prepare(
        "SELECT l.id, l.material_id AS materialId, m.name AS materialName, m.unit AS unit, l.vendor_id AS vendorId, v.name AS vendorName, l.vendor_lot_number AS vendorLotNumber, l.invoice_number AS invoiceNumber, l.purchased_on AS purchasedOn, l.received_qty AS receivedQty, COALESCE(SUM(u.qty_used), 0) AS usedQty, l.received_qty - COALESCE(SUM(u.qty_used), 0) AS availableQty, l.unit_cost AS unitCost, l.created_at AS createdAt FROM inventory_purchase_lots l JOIN inventory_materials m ON m.id = l.material_id JOIN inventory_vendors v ON v.id = l.vendor_id LEFT JOIN inventory_batch_material_usage u ON u.purchase_lot_id = l.id GROUP BY l.id ORDER BY l.purchased_on DESC, l.created_at DESC LIMIT 500",
      ).all<PurchaseLotRow>(),
      db.prepare(
        "SELECT b.id, b.batch_no AS batchNo, b.product_id AS productId, p.name AS productName, b.manufactured_on AS manufacturedOn, b.output_qty_kg AS outputQtyKg, b.status, b.best_before AS bestBefore, b.operator_name AS operatorName, b.packaging_lot AS packagingLot, b.notes, b.created_by AS createdBy, b.created_at AS createdAt, b.updated_at AS updatedAt, (SELECT qc.qc_status FROM inventory_quality_checks qc WHERE qc.batch_id = b.id ORDER BY qc.checked_at DESC LIMIT 1) AS qcStatus, (SELECT qc.remarks FROM inventory_quality_checks qc WHERE qc.batch_id = b.id ORDER BY qc.checked_at DESC LIMIT 1) AS qcRemarks, (SELECT qc.checked_by FROM inventory_quality_checks qc WHERE qc.batch_id = b.id ORDER BY qc.checked_at DESC LIMIT 1) AS qcCheckedBy, (SELECT qc.checked_at FROM inventory_quality_checks qc WHERE qc.batch_id = b.id ORDER BY qc.checked_at DESC LIMIT 1) AS qcCheckedAt, (SELECT qc.moisture_pct FROM inventory_quality_checks qc WHERE qc.batch_id = b.id ORDER BY qc.checked_at DESC LIMIT 1) AS moisturePct FROM inventory_production_batches b JOIN inventory_products p ON p.id = b.product_id ORDER BY b.manufactured_on DESC, b.created_at DESC LIMIT 200",
      ).all<BatchRow>(),
      db.prepare(
        "SELECT u.id, u.batch_id AS batchId, u.material_id AS materialId, m.name AS materialName, u.unit, u.purchase_lot_id AS purchaseLotId, l.vendor_id AS vendorId, v.name AS vendorName, l.vendor_lot_number AS vendorLotNumber, l.invoice_number AS invoiceNumber, u.qty_used AS qtyUsed, u.notes FROM inventory_batch_material_usage u JOIN inventory_materials m ON m.id = u.material_id JOIN inventory_purchase_lots l ON l.id = u.purchase_lot_id JOIN inventory_vendors v ON v.id = l.vendor_id ORDER BY u.rowid",
      ).all<UsageRow>(),
      db.prepare("SELECT id, actor, action, entity_type AS entityType, entity_id AS entityId, summary, created_at AS createdAt FROM inventory_audit_logs ORDER BY created_at DESC LIMIT 60").all<ActivityRow>(),
      db.prepare(
        "SELECT COUNT(*) AS totalBatches, COALESCE(SUM(output_qty_kg), 0) AS totalOutputKg, SUM(CASE WHEN strftime('%Y-%m', manufactured_on) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) AS monthBatches, COALESCE(SUM(CASE WHEN strftime('%Y-%m', manufactured_on) = strftime('%Y-%m', 'now') THEN output_qty_kg ELSE 0 END), 0) AS monthOutputKg, SUM(CASE WHEN status IN ('draft', 'in_progress', 'qc_hold') THEN 1 ELSE 0 END) AS qcPending FROM inventory_production_batches",
      ).first<StatsRow>(),
    ])

    const usageByBatch = new Map<string, UsageRow[]>()
    for (const usage of usageResult.results ?? []) {
      const current = usageByBatch.get(usage.batchId) ?? []
      current.push(usage)
      usageByBatch.set(usage.batchId, current)
    }

    const batches = (batchesResult.results ?? []).map((batch) => ({
      ...batch,
      materials: usageByBatch.get(batch.id) ?? [],
    }))

    return jsonResponse({
      products: productsResult.results ?? [],
      finishedStock: finishedStockResult.results ?? [],
      vendors: vendorsResult.results ?? [],
      materials: materialsResult.results ?? [],
      purchaseLots: lotsResult.results ?? [],
      batches,
      activity: activityResult.results ?? [],
      stats: statsResult ?? {
        totalBatches: 0,
        totalOutputKg: 0,
        monthBatches: 0,
        monthOutputKg: 0,
        qcPending: 0,
      },
      recentBatchLimit: 200,
    })
  } catch (error) {
    console.error("Inventory read failed:", error)
    return jsonResponse({ error: "Could not load inventory records." }, 500)
  }
}

export async function POST(request: Request) {
  const auth = await authorize(request)
  if ("response" in auth) return auth.response

  const db = getInventoryDB()
  if (!db) return jsonResponse({ error: "Inventory database is not connected. Follow INVENTORY_SETUP.md to create and bind swadam_inventory." }, 503)

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return jsonResponse({ error: "Invalid request body." }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400)
  }

  const type = textValue(body.type, 30)

  try {
    if (type === "product") {
      const name = textValue(body.name, 120)
      const code = textValue(body.code, 40).toUpperCase()
      const category = textValue(body.category, 80)
      const description = textValue(body.description, 500)
      if (!name) return jsonResponse({ error: "Product name is required." }, 400)

      const id = crypto.randomUUID()
      await db.batch([
        db.prepare("INSERT INTO inventory_products (id, code, name, category, description) VALUES (?, ?, ?, ?, ?)").bind(id, code || ("PRD-" + id.slice(0, 8).toUpperCase()), name, category || null, description || null),
        auditStatement(db, auth.email, "created", "product", id, "Added product " + name),
      ])
      return jsonResponse({ success: true, id }, 201)
    }

    if (type === "finished_stock") {
      const productId = textValue(body.productId, 64)
      const packSizeGrams = Number(body.packSizeGrams)
      const packetsOnHand = Number(body.packetsOnHand)
      const notes = textValue(body.notes, 500)
      if (!productId) return jsonResponse({ error: "Choose a product for this packet stock record." }, 400)
      if (!Number.isSafeInteger(packSizeGrams) || packSizeGrams < 1 || packSizeGrams > 100000) {
        return jsonResponse({ error: "Packet size must be a whole number of grams greater than zero." }, 400)
      }
      if (!Number.isSafeInteger(packetsOnHand) || packetsOnHand < 0 || packetsOnHand > 100000000) {
        return jsonResponse({ error: "Packet count must be a whole number zero or greater." }, 400)
      }

      const product = await db.prepare("SELECT id, name FROM inventory_products WHERE id = ?").bind(productId).first<{ id: string; name: string }>()
      if (!product) return jsonResponse({ error: "The selected product does not exist." }, 404)
      const current = await db.prepare("SELECT id, packets_on_hand AS packetsOnHand FROM inventory_finished_stock WHERE product_id = ? AND pack_size_g = ?")
        .bind(productId, packSizeGrams).first<{ id: string; packetsOnHand: number }>()
      const id = current?.id ?? crypto.randomUUID()
      const previousCount = current?.packetsOnHand ?? 0
      await db.batch([
        db.prepare("INSERT INTO inventory_finished_stock (id, product_id, pack_size_g, packets_on_hand, notes, updated_by) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(product_id, pack_size_g) DO UPDATE SET packets_on_hand = excluded.packets_on_hand, notes = excluded.notes, updated_by = excluded.updated_by, updated_at = datetime('now')")
          .bind(id, productId, packSizeGrams, packetsOnHand, notes || null, auth.email),
        auditStatement(db, auth.email, current ? "updated" : "created", "finished_stock", id, product.name + " · " + packSizeGrams + " g packets: " + previousCount + " → " + packetsOnHand + " packets"),
      ])
      return jsonResponse({ success: true, id, packetsOnHand }, current ? 200 : 201)
    }

    if (type === "vendor") {
      const name = textValue(body.name, 120)
      const contactName = textValue(body.contactName, 120)
      const phone = textValue(body.phone, 30)
      const email = textValue(body.email, 160).toLowerCase()
      const gstin = textValue(body.gstin, 20).toUpperCase()
      const address = textValue(body.address, 300)
      const notes = textValue(body.notes, 500)
      if (!name) return jsonResponse({ error: "Vendor name is required." }, 400)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonResponse({ error: "Enter a valid vendor email." }, 400)

      const id = crypto.randomUUID()
      await db.batch([
        db.prepare("INSERT INTO inventory_vendors (id, name, contact_name, phone, email, gstin, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, name, contactName || null, phone || null, email || null, gstin || null, address || null, notes || null),
        auditStatement(db, auth.email, "created", "vendor", id, "Added vendor " + name),
      ])
      return jsonResponse({ success: true, id }, 201)
    }

    if (type === "material") {
      const name = textValue(body.name, 120)
      const code = textValue(body.code, 40).toUpperCase()
      const category = textValue(body.category, 80)
      const unit = textValue(body.unit, 12)
      const description = textValue(body.description, 500)
      if (!name) return jsonResponse({ error: "Material name is required." }, 400)
      if (!["kg", "g", "litre", "unit"].includes(unit)) return jsonResponse({ error: "Choose a supported unit." }, 400)

      const id = crypto.randomUUID()
      await db.batch([
        db.prepare("INSERT INTO inventory_materials (id, code, name, category, unit, description) VALUES (?, ?, ?, ?, ?, ?)").bind(id, code || ("MAT-" + id.slice(0, 8).toUpperCase()), name, category || null, unit, description || null),
        auditStatement(db, auth.email, "created", "material", id, "Added material " + name),
      ])
      return jsonResponse({ success: true, id }, 201)
    }

    if (type === "purchase_lot") {
      const materialId = textValue(body.materialId, 64)
      const vendorId = textValue(body.vendorId, 64)
      const vendorLotNumber = textValue(body.vendorLotNumber, 80)
      const invoiceNumber = textValue(body.invoiceNumber, 80)
      const purchasedOn = textValue(body.purchasedOn, 10)
      const receivedQty = positiveNumber(body.receivedQty)
      const unitCost = optionalNumber(body.unitCost)
      if (!materialId || !vendorId || !purchasedOn || !validDate(purchasedOn) || !receivedQty) {
        return jsonResponse({ error: "Select a vendor and material, enter a valid purchase date and quantity." }, 400)
      }
      if (body.unitCost !== undefined && body.unitCost !== "" && unitCost === null) return jsonResponse({ error: "Unit cost must be zero or greater." }, 400)

      const id = crypto.randomUUID()
      await db.batch([
        db.prepare("INSERT INTO inventory_purchase_lots (id, material_id, vendor_id, vendor_lot_number, invoice_number, purchased_on, received_qty, unit_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, materialId, vendorId, vendorLotNumber || null, invoiceNumber || null, purchasedOn, receivedQty, unitCost),
        auditStatement(db, auth.email, "created", "purchase_lot", id, "Received " + receivedQty + " units of material against a vendor purchase lot"),
      ])
      return jsonResponse({ success: true, id }, 201)
    }

    if (type === "batch") {
      const batchNo = textValue(body.batchNo, 40).toUpperCase()
      const productId = textValue(body.productId, 64)
      const manufacturedOn = textValue(body.manufacturedOn, 10)
      const outputQtyKg = positiveNumber(body.outputQtyKg)
      const bestBefore = textValue(body.bestBefore, 10)
      const operatorName = textValue(body.operatorName, 120)
      const packagingLot = textValue(body.packagingLot, 80)
      const notes = textValue(body.notes, 1000)
      const rawMaterials = Array.isArray(body.materials) ? body.materials : []
      if (!batchNo || !/^[A-Z0-9][A-Z0-9/_-]{1,39}$/.test(batchNo)) return jsonResponse({ error: "Enter a valid, unique batch number." }, 400)
      if (!productId || !manufacturedOn || !validDate(manufacturedOn) || !outputQtyKg) return jsonResponse({ error: "Select a product, manufacturing date and finished quantity in kg." }, 400)
      if (bestBefore && !validDate(bestBefore)) return jsonResponse({ error: "Enter a valid best-before date." }, 400)
      if (!rawMaterials.length || rawMaterials.length > 40) return jsonResponse({ error: "Add between 1 and 40 material usage lines." }, 400)

      const id = crypto.randomUUID()
      const usageLines: Array<{ lotId: string; materialId: string; qtyUsed: number; notes: string }> = []
      for (const rawLine of rawMaterials) {
        if (!rawLine || typeof rawLine !== "object") return jsonResponse({ error: "Invalid material usage line." }, 400)
        const line = rawLine as Record<string, unknown>
        const lotId = textValue(line.purchaseLotId, 64)
        const qtyUsed = positiveNumber(line.qtyUsed)
        if (!lotId || !qtyUsed) return jsonResponse({ error: "Each material line needs a purchase lot and quantity used." }, 400)
        const lot = await db.prepare("SELECT id, material_id AS materialId FROM inventory_purchase_lots WHERE id = ?").bind(lotId).first<{ id: string; materialId: string }>()
        if (!lot) return jsonResponse({ error: "One of the selected purchase lots no longer exists." }, 409)
        usageLines.push({ lotId, materialId: lot.materialId, qtyUsed, notes: textValue(line.notes, 200) })
      }

      const statements = [
        db.prepare("INSERT INTO inventory_production_batches (id, batch_no, product_id, manufactured_on, output_qty_kg, status, best_before, operator_name, packaging_lot, notes, created_by) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)").bind(id, batchNo, productId, manufacturedOn, outputQtyKg, bestBefore || null, operatorName || null, packagingLot || null, notes || null, auth.email),
        ...usageLines.map((line) =>
          db.prepare("INSERT INTO inventory_batch_material_usage (id, batch_id, material_id, purchase_lot_id, qty_used, unit, notes) SELECT ?, ?, ?, l.id, ?, m.unit, ? FROM inventory_purchase_lots l JOIN inventory_materials m ON m.id = l.material_id WHERE l.id = ? AND l.material_id = ?")
            .bind(crypto.randomUUID(), id, line.materialId, line.qtyUsed, line.notes || null, line.lotId, line.materialId),
        ),
        auditStatement(db, auth.email, "created", "batch", id, "Created production batch " + batchNo + " for " + outputQtyKg + " kg"),
      ]
      await db.batch(statements)
      return jsonResponse({ success: true, id, batchNo }, 201)
    }

    return jsonResponse({ error: "Unsupported inventory record type." }, 400)
  } catch (error) {
    const message = String(error)
    if (message.includes("UNIQUE constraint failed")) return jsonResponse({ error: "That code, batch number or record identifier already exists." }, 409)
    if (message.includes("INSUFFICIENT_PURCHASE_LOT_BALANCE")) return jsonResponse({ error: "This batch would consume more material than the selected purchase lot has available." }, 409)
    if (message.includes("PURCHASE_LOT_MATERIAL_MISMATCH")) return jsonResponse({ error: "The selected purchase lot is not valid for this material." }, 409)
    console.error("Inventory create failed:", error)
    return jsonResponse({ error: "Could not save this inventory record." }, 500)
  }
}

export async function PATCH(request: Request) {
  const auth = await authorize(request)
  if ("response" in auth) return auth.response

  const db = getInventoryDB()
  if (!db) return jsonResponse({ error: "Inventory database is not connected." }, 503)

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return jsonResponse({ error: "Invalid request body." }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400)
  }

  if (textValue(body.type, 30) !== "quality") return jsonResponse({ error: "Unsupported inventory update." }, 400)

  const batchId = textValue(body.batchId, 64)
  const status = textValue(body.status, 20)
  const remarks = textValue(body.remarks, 1000)
  const moisturePct = optionalNumber(body.moisturePct)
  const checkedAt = textValue(body.checkedAt, 10)
  if (!batchId || !["approved", "hold", "rejected"].includes(status)) return jsonResponse({ error: "Select a valid batch and quality decision." }, 400)
  if (body.moisturePct !== undefined && body.moisturePct !== "" && (moisturePct === null || moisturePct > 100)) {
    return jsonResponse({ error: "Moisture percentage must be between 0 and 100." }, 400)
  }
  if (checkedAt && !validDate(checkedAt)) return jsonResponse({ error: "Enter a valid inspection date." }, 400)

  const batchStatus = status === "approved" ? "released" : status === "rejected" ? "rejected" : "qc_hold"
  const id = crypto.randomUUID()
  try {
    await db.batch([
      db.prepare("UPDATE inventory_production_batches SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(batchStatus, batchId),
      db.prepare("INSERT INTO inventory_quality_checks (id, batch_id, qc_status, moisture_pct, remarks, checked_by, checked_at) VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))").bind(id, batchId, status, moisturePct, remarks || null, auth.email, checkedAt || null),
      auditStatement(db, auth.email, "quality_check", "batch", batchId, "Quality decision: " + status),
    ])
    return jsonResponse({ success: true, batchId, status: batchStatus })
  } catch (error) {
    console.error("Inventory quality update failed:", error)
    return jsonResponse({ error: "Could not save the quality decision. Confirm the batch exists and try again." }, 500)
  }
}
