import { jsonResponse } from "@/lib/api"

export const dynamic = "force-dynamic"

export function GET() {
  return jsonResponse({ ok: true })
}
