import type { Metadata } from "next"
import { headers } from "next/headers"
import { InventoryWorkspace } from "@/components/inventory-workspace"
import { verifyInventoryAccess } from "@/lib/cloudflare-access"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Private Inventory | Swadam Foods",
  description: "Private production, supplier and material traceability workspace.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

export default async function InventoryPage() {
  const requestHeaders = await headers()
  const access = await verifyInventoryAccess(requestHeaders.get("cf-access-jwt-assertion"))

  if (!access.ok) {
    const notConfigured = access.reason === "not_configured"
    return (
      <main className="ambient-bg flex min-h-screen items-center justify-center p-5">
        <section className="glass-panel w-full max-w-xl rounded-[2rem] p-8 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="text-2xl" aria-hidden="true">⌑</span>
          </div>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.22em] text-primary">Swadam Foods · Private workspace</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {notConfigured ? "Inventory access needs configuration" : "This area is private"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {notConfigured
              ? "The application is deployed, but Cloudflare Access verification has not been configured at the Worker yet. Follow INVENTORY_SETUP.md in the repository before using this workspace."
              : "A valid Cloudflare Access session is required to open Swadam Foods inventory."}
          </p>
          <a href="/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90">
            Return to storefront
          </a>
        </section>
      </main>
    )
  }

  return <InventoryWorkspace currentUserEmail={access.email} />
}
