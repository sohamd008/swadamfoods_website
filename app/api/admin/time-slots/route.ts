import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

export const dynamic = "force-dynamic"

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function verifyAdminKey(request: Request, env: Record<string, string | undefined>): boolean {
  const adminKey = env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET_KEY
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

type SlotRow = {
  id: string
  label: string
  start_time: string
  end_time: string
  capacity: number
  booked: number
  is_active: number
  slot_date: string
}

const DEFAULT_SLOTS = [
  { id: "morning", label: "10:00 AM – 1:00 PM", startTime: "10:00", endTime: "13:00", capacity: 10, booked: 0, isActive: true },
  { id: "afternoon", label: "2:00 PM – 6:00 PM", startTime: "14:00", endTime: "18:00", capacity: 10, booked: 0, isActive: true },
  { id: "evening", label: "6:00 PM – 9:00 PM", startTime: "18:00", endTime: "21:00", capacity: 10, booked: 0, isActive: true },
]

function getCF() {
  try {
    const { env } = getCloudflareContext()
    const envMap = (env ?? {}) as unknown as Record<string, string | undefined>
    const db = (env as unknown as { DB?: D1Database })?.DB
    return { envMap, db }
  } catch {
    return { envMap: (process.env ?? {}) as Record<string, string | undefined>, db: undefined }
  }
}

export async function GET(request: Request) {
  const { envMap, db } = getCF()
  if (!verifyAdminKey(request, envMap)) {
    return json({ error: "Unauthorized." }, 401)
  }

  if (!db || typeof db.prepare !== "function") {
    return json({ slots: DEFAULT_SLOTS })
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const result = await db
      .prepare(
        `SELECT id, label, start_time, end_time, capacity, booked, is_active, slot_date
         FROM delivery_time_slots
         WHERE slot_date = ?
         ORDER BY start_time ASC`,
      )
      .bind(today)
      .all<SlotRow>()

    const slots = result.results ?? []

    if (slots.length === 0) {
      for (const s of DEFAULT_SLOTS) {
        await db
          .prepare(
            `INSERT OR IGNORE INTO delivery_time_slots (id, label, start_time, end_time, capacity, booked, is_active, slot_date)
             VALUES (?, ?, ?, ?, ?, 0, 1, ?)`,
          )
          .bind(s.id, s.label, s.startTime, s.endTime, s.capacity, today)
          .run()
      }
      return json({ slots: DEFAULT_SLOTS })
    }

    return json({
      slots: slots.map((s) => ({
        id: s.id,
        label: s.label,
        startTime: s.start_time,
        endTime: s.end_time,
        capacity: s.capacity,
        booked: s.booked,
        isActive: s.is_active === 1,
        available: Math.max(0, s.capacity - s.booked),
      })),
    })
  } catch {
    return json({ slots: DEFAULT_SLOTS })
  }
}

export async function PATCH(request: Request) {
  const { envMap, db } = getCF()
  if (!verifyAdminKey(request, envMap)) {
    return json({ error: "Unauthorized." }, 401)
  }

  let body: { slotId?: unknown; capacity?: unknown; isActive?: unknown }
  try {
    body = (await request.json()) as { slotId?: unknown; capacity?: unknown; isActive?: unknown }
  } catch {
    return json({ error: "Invalid JSON." }, 400)
  }

  const slotId = typeof body.slotId === "string" ? body.slotId.trim() : ""
  if (!slotId) return json({ error: "Missing slotId." }, 400)

  if (!db || typeof db.prepare !== "function") {
    return json({ success: true })
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    if (typeof body.capacity === "number") {
      await db
        .prepare(
          `UPDATE delivery_time_slots SET capacity = ? WHERE id = ? AND slot_date = ?`,
        )
        .bind(Math.max(0, Math.floor(body.capacity)), slotId, today)
        .run()
    }
    if (typeof body.isActive === "boolean") {
      await db
        .prepare(
          `UPDATE delivery_time_slots SET is_active = ? WHERE id = ? AND slot_date = ?`,
        )
        .bind(body.isActive ? 1 : 0, slotId, today)
        .run()
    }
    return json({ success: true })
  } catch {
    return json({ error: "Database error." }, 500)
  }
}
