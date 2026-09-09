import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"

export const dynamic = "force-dynamic"

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "public, max-age=120, s-maxage=120",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

type SlotRow = {
  id: string
  label: string
  start_time: string
  end_time: string
  capacity: number
  booked: number
  is_active: number
}

const DEFAULT_SLOTS = [
  { id: "morning", label: "10:00 AM – 1:00 PM", startTime: "10:00", endTime: "13:00", capacity: 10, booked: 0, isActive: true, available: 10 },
  { id: "afternoon", label: "2:00 PM – 6:00 PM", startTime: "14:00", endTime: "18:00", capacity: 10, booked: 0, isActive: true, available: 10 },
  { id: "evening", label: "6:00 PM – 9:00 PM", startTime: "18:00", endTime: "21:00", capacity: 10, booked: 0, isActive: true, available: 10 },
]

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
    return json({ slots: DEFAULT_SLOTS })
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const result = await db
      .prepare(
        `SELECT id, label, start_time, end_time, capacity, booked, is_active
         FROM delivery_time_slots
         WHERE slot_date = ? AND is_active = 1
         ORDER BY start_time ASC`,
      )
      .bind(today)
      .all<SlotRow>()

    const slots = result.results ?? []
    if (slots.length === 0) return json({ slots: DEFAULT_SLOTS })

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
