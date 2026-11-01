"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Clock3, History, Pencil, Plus, Search, TrendingUp, X } from "lucide-react"

type VendorOption = { id: string; name: string }
type MaterialOption = { id: string; name: string; code: string; unit: string }
type VendorRate = {
  id: string
  vendorId: string
  vendorName: string
  materialId: string
  materialName: string
  materialCode: string
  unit: string
  rate: number
  currency: string
  effectiveFrom: string
  notes: string | null
  updatedBy: string
  updatedAt: string
}
type RateVersion = {
  id: string
  rateId: string
  version: number
  previousRate: number | null
  newRate: number
  currency: string
  effectiveFrom: string
  notes: string | null
  changedBy: string
  changedAt: string
}

const INPUT = "min-h-12 w-full rounded-xl border border-border bg-background/75 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
const LABEL = "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground"
const BUTTON = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 3 }).format(Number(value || 0))
}
function dateLabel(value: string) {
  if (!value) return "—"
  const parsed = new Date(value.length === 10 ? value + "T00:00:00" : value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed)
}
function dateTimeLabel(value: string) {
  if (!value) return "—"
  const parsed = new Date(value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"))
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(parsed)
}

function VendorRateModal({ vendors, materials, initial, onClose, onSave }: {
  vendors: VendorOption[]
  materials: MaterialOption[]
  initial?: VendorRate
  onClose: () => void
  onSave: (value: Record<string, string>) => Promise<boolean>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [vendorId, setVendorId] = useState(initial?.vendorId ?? "")
  const [materialId, setMaterialId] = useState(initial?.materialId ?? "")
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    const value: Record<string, string> = { type: "vendor_rate" }
    new FormData(event.currentTarget).forEach((field, key) => { value[key] = String(field) })
    const ok = await onSave(value)
    setSaving(false)
    if (ok) onClose()
    else setError("The rate could not be saved. Check the selected vendor, ingredient and amount.")
  }
  const material = materials.find(item => item.id === materialId)
  return <div className="fixed inset-0 z-[90] flex items-end justify-center bg-stone-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label={initial ? "Update vendor rate" : "Add vendor rate"} className="glass-panel max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight sm:text-2xl">{initial ? "Update ingredient rate" : "Add vendor ingredient rate"}</h2><p className="mt-1 text-sm text-muted-foreground">Every save creates a new version. Previous prices remain in the history.</p></div><button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70"><X className="h-5 w-5" /></button></div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block"><span className={LABEL}>Vendor *</span><select className={INPUT} name="vendorId" required value={vendorId} onChange={event => setVendorId(event.target.value)}><option value="">Choose vendor</option>{vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>
        <label className="block"><span className={LABEL}>Ingredient / raw material *</span><select className={INPUT} name="materialId" required value={materialId} onChange={event => setMaterialId(event.target.value)}><option value="">Choose ingredient</option>{materials.map(item => <option key={item.id} value={item.id}>{item.name} · {item.code} · per {item.unit}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={LABEL}>Rate (₹) per {material?.unit ?? "unit"} *</span><input className={INPUT} type="number" name="rate" required min="0" max="1000000000000" step="0.001" defaultValue={initial?.rate ?? ""} placeholder="e.g. 125.50" /></label>
          <label className="block"><span className={LABEL}>Effective from *</span><input className={INPUT} type="date" name="effectiveFrom" required defaultValue={initial?.effectiveFrom ?? new Date().toISOString().slice(0, 10)} /></label>
        </div>
        <label className="block"><span className={LABEL}>Change note (optional)</span><textarea className={INPUT + " min-h-24 resize-y"} rows={3} name="notes" maxLength={500} defaultValue={initial?.notes ?? ""} placeholder="e.g. New supplier quotation / revised rate" /></label>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm leading-6 text-muted-foreground">Rates are stored in INR per the ingredient's base unit. For example, if the material unit is kg, enter the price per kg. Saving creates a new numbered version rather than overwriting the previous price.</div>
        {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button><button type="submit" disabled={saving || !vendors.length || !materials.length} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving..." : "Save rate & version"}</button></div>
      </form>
    </section>
  </div>
}

export function VendorRatesPanel({ vendors, materials, rates, versions, onSave }: {
  vendors: VendorOption[]
  materials: MaterialOption[]
  rates: VendorRate[]
  versions: RateVersion[]
  onSave: (value: Record<string, string>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState<VendorRate | null | undefined>(undefined)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [vendorFilter, setVendorFilter] = useState("all")
  const [materialFilter, setMaterialFilter] = useState("all")
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rates.filter(rate => (vendorFilter === "all" || rate.vendorId === vendorFilter)
      && (materialFilter === "all" || rate.materialId === materialFilter)
      && (!q || rate.vendorName.toLowerCase().includes(q) || rate.materialName.toLowerCase().includes(q) || rate.materialCode.toLowerCase().includes(q)))
  }, [rates, search, vendorFilter, materialFilter])
  const orderedVersions = (rateId: string) => versions.filter(version => version.rateId === rateId).sort((a,b) => b.version - a.version)

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-black tracking-tight sm:text-xl">Vendor ingredient rates</h2><p className="mt-1 text-sm text-muted-foreground">Manage each supplier's price for each raw material, with permanent version history.</p></div><button type="button" onClick={() => setEditing(null)} disabled={!vendors.length || !materials.length} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Add vendor rate</button></div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Vendors</p><p className="mt-2 text-2xl font-black">{vendors.length}</p></div>
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Current vendor rates</p><p className="mt-2 text-2xl font-black">{rates.length}</p></div>
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Saved versions</p><p className="mt-2 text-2xl font-black">{versions.length}</p></div>
    </div>

    {!vendors.length || !materials.length ? <div className="glass-panel rounded-3xl p-7 text-center"><TrendingUp className="mx-auto h-9 w-9 text-primary" /><h3 className="mt-4 font-black">Add vendors and ingredients first</h3><p className="mt-2 text-sm text-muted-foreground">Create at least one vendor and one raw material in their existing Inventory sections before adding a rate.</p></div> : null}

    {vendors.length > 0 && materials.length > 0 ? <section className="glass-panel rounded-3xl p-4 sm:p-6">
      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <label className="relative block"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={INPUT + " pl-10"} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search vendor, ingredient or code..." /></label>
        <select aria-label="Filter vendor" className={INPUT} value={vendorFilter} onChange={event => setVendorFilter(event.target.value)}><option value="all">All vendors</option>{vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
        <select aria-label="Filter ingredient" className={INPUT} value={materialFilter} onChange={event => setMaterialFilter(event.target.value)}><option value="all">All ingredients</option>{materials.map(material => <option key={material.id} value={material.id}>{material.name}</option>)}</select>
      </div>
      {filtered.length ? <div className="space-y-3">{filtered.map(rate => {
        const history = orderedVersions(rate.id)
        return <article key={rate.id} className="rounded-2xl border border-border bg-background/55 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-wide text-primary">{rate.vendorName}</p><h3 className="mt-1 text-lg font-black">{rate.materialName}</h3><p className="mt-1 text-xs text-muted-foreground">{rate.materialCode} · priced per {rate.unit}</p></div>
            <div className="text-left sm:text-right"><p className="text-2xl font-black tabular-nums">{money(rate.rate, rate.currency)}</p><p className="mt-1 text-xs text-muted-foreground">Effective {dateLabel(rate.effectiveFrom)}</p></div>
          </div>
          {rate.notes ? <p className="mt-3 text-sm text-muted-foreground">{rate.notes}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <button type="button" onClick={() => setEditing(rate)} className={BUTTON + " border border-border bg-background/75"}><Pencil className="h-4 w-4" /> Update rate</button>
            <button type="button" onClick={() => setExpanded(expanded === rate.id ? null : rate.id)} className={BUTTON + " border border-border bg-background/75"}><History className="h-4 w-4" /> {expanded === rate.id ? "Hide history" : "Version history"} <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{history.length}</span></button>
            <span className="ml-auto text-[11px] text-muted-foreground">Last updated {dateTimeLabel(rate.updatedAt)} · {rate.updatedBy}</span>
          </div>
          {expanded === rate.id ? <div className="mt-4 rounded-xl border border-border bg-secondary/35 p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /><h4 className="text-sm font-extrabold">Rate version history</h4></div>
            {history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><th className="px-3 py-2">Version</th><th className="px-3 py-2">Previous rate</th><th className="px-3 py-2">New rate</th><th className="px-3 py-2">Effective from</th><th className="px-3 py-2">Changed by / date</th></tr></thead><tbody>{history.map(version => <tr key={version.id} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-bold">v{version.version}</td><td className="px-3 py-3 tabular-nums">{version.previousRate === null ? "—" : money(version.previousRate, version.currency)}</td><td className="px-3 py-3 font-extrabold tabular-nums">{money(version.newRate, version.currency)}</td><td className="px-3 py-3 whitespace-nowrap">{dateLabel(version.effectiveFrom)}</td><td className="px-3 py-3"><p>{version.changedBy}</p><p className="mt-1 text-xs text-muted-foreground">{dateTimeLabel(version.changedAt)}</p></td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">No rate versions found.</p>}
            {history.some(version => version.notes) ? <div className="mt-3 space-y-1 border-t border-border pt-3">{history.filter(version => version.notes).map(version => <p key={version.id} className="text-xs text-muted-foreground">v{version.version}: {version.notes}</p>)}</div> : null}
          </div> : null}
        </article>
      })}</div> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center"><p className="font-bold">No matching vendor rates</p><p className="mt-1 text-sm text-muted-foreground">Add a rate or change the filters.</p></div>}
    </section> : null}
    {editing !== undefined ? <VendorRateModal vendors={vendors} materials={materials} initial={editing ?? undefined} onClose={() => setEditing(undefined)} onSave={onSave} /> : null}
  </div>
}
