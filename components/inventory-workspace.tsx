"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  Activity, AlertCircle, ArrowDownToLine, ArrowRight, Boxes, CalendarDays, Check, CheckCircle2,
  Clock3, Factory, Filter, LayoutDashboard, LockKeyhole, Package, Pencil, Plus,
  RefreshCw, Search, ShieldCheck, Trash2, Truck, Wallet, Wheat, X,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { VendorRatesPanel } from "@/components/vendor-rates-panel"

type Product = { id: string; code: string; name: string; category: string | null; description: string | null; is_active: number; batchCount: number; finishedStockCount: number }
type FinishedStock = { id: string; productId: string; productName: string; productCode: string; packSizeG: number; packetsOnHand: number; notes: string | null; updatedBy: string; updatedAt: string }
type VendorRate = { id: string; vendorId: string; vendorName: string; materialId: string; materialName: string; materialCode: string; unit: string; rate: number; currency: string; effectiveFrom: string; notes: string | null; updatedBy: string; updatedAt: string }
type VendorRateVersion = { id: string; rateId: string; version: number; previousRate: number | null; newRate: number; currency: string; effectiveFrom: string; notes: string | null; changedBy: string; changedAt: string }
type Vendor = { id: string; name: string; contact_name: string | null; phone: string | null; email: string | null; gstin: string | null; address: string | null; notes: string | null; is_active: number; purchaseLotCount: number; usedPurchaseLotCount: number; affectedBatchCount: number }
type Material = { id: string; code: string; name: string; category: string | null; unit: string; description: string | null; is_active: number; purchaseLotCount: number }
type PurchaseLot = {
  id: string; materialId: string; materialName: string; unit: string; vendorId: string; vendorName: string
  vendorLotNumber: string | null; invoiceNumber: string | null; purchasedOn: string
  receivedQty: number; usedQty: number; availableQty: number; unitCost: number | null
}
type Usage = {
  id: string; batchId: string; materialId: string; materialName: string; unit: string
  purchaseLotId: string; vendorId: string; vendorName: string; vendorLotNumber: string | null
  invoiceNumber: string | null; qtyUsed: number; notes: string | null
}
type Batch = {
  id: string; batchNo: string; productId: string; productName: string; manufacturedOn: string
  outputQtyKg: number; status: string; bestBefore: string | null; operatorName: string | null
  packagingLot: string | null; notes: string | null; createdBy: string; createdAt: string; updatedAt: string
  qcStatus: string | null; qcRemarks: string | null; qcCheckedBy: string | null; qcCheckedAt: string | null
  moisturePct: number | null; materials: Usage[]
}
type ActivityLog = { id: string; actor: string; action: string; entityType: string; entityId: string; summary: string; createdAt: string }
type Snapshot = {
  products: Product[]; finishedStock: FinishedStock[]; vendors: Vendor[]; materials: Material[]; purchaseLots: PurchaseLot[]
  vendorRates: VendorRate[]; vendorRateVersions: VendorRateVersion[]
  batches: Batch[]; activity: ActivityLog[]
  stats: { totalBatches: number; totalOutputKg: number; monthBatches: number; monthOutputKg: number; qcPending: number }
}
type TabId = "overview" | "batches" | "products" | "finished_stock" | "vendors" | "vendor_rates" | "raw_materials" | "materials" | "activity"
type EntityKind = "product" | "vendor" | "material" | "purchase_lot"
type EditableMaster = { kind: "product"; record: Product } | { kind: "vendor"; record: Vendor } | { kind: "material"; record: Material }
type DeletableMaster = EditableMaster

const MATERIAL_CATEGORIES = [
  "Grains & cereals",
  "Flours & starches",
  "Pulses & legumes",
  "Nuts & seeds",
  "Spices & seasonings",
  "Herbs & flavourings",
  "Oils & fats",
  "Sweeteners",
  "Dairy ingredients",
  "Dried fruits",
  "Fruits & vegetables",
  "Packaging materials",
  "Processing aids",
  "Other",
] as const

const NAV: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "batches", label: "Production batches", icon: Factory },
  { id: "products", label: "Products", icon: Package },
  { id: "finished_stock", label: "Finished packets", icon: Boxes },
  { id: "vendors", label: "Vendors", icon: Truck },
  { id: "vendor_rates", label: "Vendor rates", icon: Wallet },
  { id: "raw_materials", label: "Raw materials", icon: Wheat },
  { id: "materials", label: "Materials & lots", icon: Boxes },
  { id: "activity", label: "Activity history", icon: Activity },
]

const BUTTON = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
const INPUT = "min-h-12 w-full rounded-xl border border-border bg-background/75 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
const LABEL = "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground"

function number(value: number, digits = 1) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(value || 0))
}
function date(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value.length === 10 ? value + "T00:00:00" : value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed)
}
function dateTime(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"))
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(parsed)
}
function statusText(status: string) {
  const labels: Record<string, string> = { draft: "Draft", in_progress: "In production", qc_hold: "On hold", released: "Released", rejected: "Rejected", approved: "Approved", hold: "On hold" }
  return labels[status] ?? status
}
function StatusPill({ status }: { status: string }) {
  const tone = status === "released" || status === "approved"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : status === "rejected"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : status === "qc_hold" || status === "hold"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
        : "border-border bg-secondary/75 text-muted-foreground"
  return <span className={"inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold " + tone}>{statusText(status)}</span>
}
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={"glass-panel rounded-2xl p-4 sm:rounded-3xl sm:p-5 " + className}>{children}</section>
}
function Heading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">{title}</h2>{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}</div>{action}</div>
}
function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Boxes }) {
  return <div className="glass-card rounded-2xl p-4 sm:rounded-3xl sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold tracking-wide text-muted-foreground">{label}</p><p className="mt-2 truncate text-2xl font-black tracking-tight text-foreground sm:text-3xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span></div></div>
}
function Field({ label, name, required, type = "text", placeholder, step, min }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string; step?: string; min?: string }) {
  return <label className="block"><span className={LABEL}>{label}{required ? " *" : ""}</span><input className={INPUT} name={name} type={type} required={required} placeholder={placeholder} step={step} min={min} /></label>
}
function SelectField({ label, name, required, children }: { label: string; name: string; required?: boolean; children: ReactNode }) {
  return <label className="block"><span className={LABEL}>{label}{required ? " *" : ""}</span><select className={INPUT} name={name} required={required} defaultValue="">{children}</select></label>
}
function Modal({ title, description, onClose, children, wide = false }: { title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-stone-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className={"glass-panel max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7 " + (wide ? "max-w-4xl" : "max-w-2xl")}><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h2>{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}</div><button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground"><X className="h-5 w-5" /></button></div>{children}</section></div>
}
function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/45 px-6 py-10 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Boxes className="h-6 w-6" /></span><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>
}

function EntityModal({ initialKind, data, onClose, onCreate }: { initialKind: EntityKind; data: Snapshot; onClose: () => void; onCreate: (value: Record<string, string>) => Promise<boolean> }) {
  const [kind, setKind] = useState<EntityKind>(initialKind)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true); setError("")
    const values: Record<string, string> = { type: kind }
    new FormData(event.currentTarget).forEach((value, key) => { values[key] = String(value) })
    const success = await onCreate(values)
    setSaving(false)
    if (!success) setError("The record could not be saved. Check the fields and try again.")
  }
  return <Modal title="Add a master record" description="Build the product, supplier and raw-material catalogue." onClose={onClose}>
    <form onSubmit={submit} className="space-y-5">
      <label className="block"><span className={LABEL}>Record type</span><select className={INPUT} value={kind} onChange={(event) => { setKind(event.target.value as EntityKind); setError("") }}><option value="product">Product</option><option value="vendor">Vendor</option><option value="material">Raw material</option><option value="purchase_lot">Material purchase / received lot</option></select></label>
      {kind === "product" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Product name" name="name" required placeholder="e.g. Patal Poha Chivda" /><Field label="Product code" name="code" placeholder="Auto-generated when blank" /><Field label="Category" name="category" placeholder="Snacks, premixes..." /><Field label="Description" name="description" placeholder="Optional notes" /></div> : null}
      {kind === "vendor" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Vendor / business name" name="name" required placeholder="Supplier name" /><Field label="Contact person" name="contactName" placeholder="Contact name" /><Field label="Phone" name="phone" placeholder="+91..." /><Field label="Email" name="email" type="email" placeholder="vendor@example.com" /><Field label="GSTIN" name="gstin" placeholder="Optional GSTIN" /><Field label="Address" name="address" placeholder="Vendor address" /><div className="sm:col-span-2"><Field label="Notes" name="notes" placeholder="Materials supplied, payment terms..." /></div></div> : null}
      {kind === "material" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Material name" name="name" required placeholder="e.g. Flattened rice" /><Field label="Material code" name="code" placeholder="Auto-generated when blank" /><SelectField label="Category" name="category"><option value="">Choose category (optional)</option>{MATERIAL_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</SelectField><SelectField label="Base unit" name="unit" required><option value="">Choose unit</option><option value="kg">Kilograms (kg)</option><option value="g">Grams (g)</option><option value="litre">Litres</option><option value="unit">Units</option></SelectField><div className="sm:col-span-2"><Field label="Description" name="description" placeholder="Optional specifications" /></div></div> : null}
      {kind === "purchase_lot" ? <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Material" name="materialId" required><option value="">Choose material</option>{data.materials.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.unit}</option>)}</SelectField><SelectField label="Vendor" name="vendorId" required><option value="">Choose vendor</option>{data.vendors.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField><Field label="Purchase / received date" name="purchasedOn" type="date" required /><Field label="Quantity received" name="receivedQty" type="number" step="0.001" min="0.001" required placeholder="e.g. 250" /><Field label="Vendor lot number" name="vendorLotNumber" placeholder="Supplier lot reference" /><Field label="Invoice number" name="invoiceNumber" placeholder="Purchase invoice reference" /><Field label="Unit cost (INR, optional)" name="unitCost" type="number" step="0.01" min="0" placeholder="Cost per base unit" />{(!data.materials.length || !data.vendors.length) ? <p className="sm:col-span-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">Add at least one vendor and one raw material before recording a purchase lot.</p> : null}</div> : null}
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button><button type="submit" disabled={saving || (kind === "purchase_lot" && (!data.materials.length || !data.vendors.length))} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving..." : <><Plus className="h-4 w-4" /> Save record</>}</button></div>
    </form>
  </Modal>
}

function EditMasterModal({ target, onClose, onSave }: { target: EditableMaster; onClose: () => void; onSave: (value: Record<string, string>) => Promise<boolean> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    const values: Record<string, string> = { type: target.kind + "_update", id: target.record.id }
    new FormData(event.currentTarget).forEach((value, key) => { values[key] = String(value) })
    const success = await onSave(values)
    setSaving(false)
    if (!success) setError("The changes could not be saved. Check the fields and try again.")
  }
  const product = target.kind === "product" ? target.record : null
  const vendor = target.kind === "vendor" ? target.record : null
  const material = target.kind === "material" ? target.record : null
  const title = product ? "product" : vendor ? "vendor" : "raw material"
  return <Modal title={"Edit " + title} description="Update this master record while keeping its linked history." onClose={onClose}>
    <form onSubmit={submit} className="space-y-5">
      {product ? <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={LABEL}>Product name *</span><input className={INPUT} name="name" required maxLength={120} defaultValue={product.name} /></label>
        <label className="block"><span className={LABEL}>Product code *</span><input className={INPUT} name="code" required maxLength={40} defaultValue={product.code} /></label>
        <label className="block"><span className={LABEL}>Category</span><input className={INPUT} name="category" maxLength={80} defaultValue={product.category ?? ""} /></label>
        <label className="block"><span className={LABEL}>Description</span><input className={INPUT} name="description" maxLength={500} defaultValue={product.description ?? ""} /></label>
      </div> : null}
      {vendor ? <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={LABEL}>Vendor / business name *</span><input className={INPUT} name="name" required maxLength={120} defaultValue={vendor.name} /></label>
        <label className="block"><span className={LABEL}>Contact person</span><input className={INPUT} name="contactName" maxLength={120} defaultValue={vendor.contact_name ?? ""} /></label>
        <label className="block"><span className={LABEL}>Phone</span><input className={INPUT} name="phone" maxLength={30} defaultValue={vendor.phone ?? ""} /></label>
        <label className="block"><span className={LABEL}>Email</span><input className={INPUT} name="email" type="email" maxLength={160} defaultValue={vendor.email ?? ""} /></label>
        <label className="block"><span className={LABEL}>GSTIN</span><input className={INPUT} name="gstin" maxLength={20} defaultValue={vendor.gstin ?? ""} /></label>
        <label className="block"><span className={LABEL}>Address</span><input className={INPUT} name="address" maxLength={300} defaultValue={vendor.address ?? ""} /></label>
        <label className="block sm:col-span-2"><span className={LABEL}>Notes</span><input className={INPUT} name="notes" maxLength={500} defaultValue={vendor.notes ?? ""} /></label>
      </div> : null}
      {material ? <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={LABEL}>Raw material name *</span><input className={INPUT} name="name" required maxLength={120} defaultValue={material.name} /></label>
        <label className="block"><span className={LABEL}>Material code *</span><input className={INPUT} name="code" required maxLength={40} defaultValue={material.code} /></label>
        <label className="block"><span className={LABEL}>Category</span><select className={INPUT} name="category" defaultValue={material.category ?? ""}><option value="">Uncategorised</option>{material.category && !MATERIAL_CATEGORIES.some(category => category === material.category) ? <option value={material.category}>{material.category}</option> : null}{MATERIAL_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
        {material.purchaseLotCount > 0 ? <label className="block"><span className={LABEL}>Base unit</span><input className={INPUT + " cursor-not-allowed opacity-70"} readOnly value={material.unit === "kg" ? "Kilograms (kg)" : material.unit === "g" ? "Grams (g)" : material.unit === "litre" ? "Litres" : "Units"} /><p className="mt-1.5 text-[11px] text-muted-foreground">Locked because this material has purchase-lot history.</p><input type="hidden" name="unit" value={material.unit} /></label> : <label className="block"><span className={LABEL}>Base unit *</span><select className={INPUT} name="unit" required defaultValue={material.unit}><option value="kg">Kilograms (kg)</option><option value="g">Grams (g)</option><option value="litre">Litres</option><option value="unit">Units</option></select></label>}
        <label className="block sm:col-span-2"><span className={LABEL}>Description / specifications</span><textarea className={INPUT + " min-h-24 resize-y"} name="description" rows={3} maxLength={500} defaultValue={material.description ?? ""} /></label>
      </div> : null}
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button>
        <button type="submit" disabled={saving} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving..." : <><Check className="h-4 w-4" /> Save changes</>}</button>
      </div>
    </form>
  </Modal>
}

function DeleteMasterModal({ target, onClose, onDelete }: { target: DeletableMaster; onClose: () => void; onDelete: (kind: "product" | "vendor" | "material", id: string) => Promise<boolean> }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const product = target.kind === "product" ? target.record : null
  const vendor = target.kind === "vendor" ? target.record : null
  const material = target.kind === "material" ? target.record : null
  const blocked = material ? material.purchaseLotCount > 0 : product ? product.batchCount > 0 : (vendor?.usedPurchaseLotCount ?? 0) > 0
  const title = product ? "product" : vendor ? "vendor" : "raw material"
  const name = product?.name ?? vendor?.name ?? material?.name ?? ""
  const submit = async () => {
    if (blocked) return
    setDeleting(true)
    setError("")
    const success = await onDelete(target.kind, target.record.id)
    setDeleting(false)
    if (!success) setError("The record could not be deleted. Refresh and try again.")
  }
  return <Modal title={"Permanently delete " + title} description={name} onClose={onClose}>
    <div className="space-y-4">
      {product ? <p className="text-sm leading-6 text-muted-foreground">This permanently removes the product and its {product.finishedStockCount} finished-packet stock record(s). It cannot be undone.</p> : null}
      {vendor ? <p className="text-sm leading-6 text-muted-foreground">This permanently removes the vendor, its {vendor.purchaseLotCount} purchase lot(s) and its vendor-rate records, provided none of its lots have been consumed.</p> : null}
      {material ? <p className="text-sm leading-6 text-muted-foreground">This permanently removes the raw material. Any vendor rates and their version history linked to it will also be removed. It can only be deleted when it has no purchase-lot or production-use history.</p> : null}
      {blocked && product ? <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-200">Deletion is blocked because this product has {product.batchCount} production batch(es). Removing it would destroy production history and ingredient traceability.</div> : null}
      {blocked && vendor ? <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-200">Deletion is blocked because {vendor.usedPurchaseLotCount} of this vendor's purchase lots were consumed across {vendor.affectedBatchCount} production batch(es). The supplier and lot links must remain to preserve traceability.</div> : null}
      {blocked && material ? <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-200">Deletion is blocked because this material is linked to {material.purchaseLotCount} purchase lot(s). Keep it so the supplier and production records remain traceable. You can still edit its name, code, category and description.</div> : null}
      {!blocked ? <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold leading-6 text-rose-800 dark:text-rose-200">This is a permanent deletion, not an archive. This action cannot be undone.</p> : null}
      {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button>
        <button type="button" onClick={() => void submit()} disabled={blocked || deleting} className={BUTTON + " bg-rose-600 text-white hover:bg-rose-700"}>{deleting ? "Deleting..." : "Permanently delete"}</button>
      </div>
    </div>
  </Modal>
}

function RawMaterialsPanel({ materials, purchaseLots, onAdd, onEdit, onDelete }: {
  materials: Material[]
  purchaseLots: PurchaseLot[]
  onAdd: () => void
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const categories = useMemo(() => Array.from(new Set(materials.map(material => material.category || "Uncategorised"))).sort((a, b) => a.localeCompare(b)), [materials])
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return materials.filter(material => {
      const matchesCategory = category === "all" || (material.category || "Uncategorised") === category
      const matchesQuery = !value || material.name.toLowerCase().includes(value) || material.code.toLowerCase().includes(value) || (material.category ?? "").toLowerCase().includes(value) || (material.description ?? "").toLowerCase().includes(value)
      return matchesCategory && matchesQuery
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [materials, query, category])
  const totalLots = materials.reduce((sum, material) => sum + material.purchaseLotCount, 0)

  return <div className="space-y-5">
    <Heading title="Raw materials" description="Your ingredient and packaging catalogue. Edit material details or permanently remove unused records." action={<button type="button" onClick={onAdd} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Add raw material</button>} />
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Catalogue items</p><p className="mt-2 text-2xl font-black">{materials.length}</p></div>
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Categories</p><p className="mt-2 text-2xl font-black">{categories.length}</p></div>
      <div className="glass-card rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Purchase lots linked</p><p className="mt-2 text-2xl font-black">{totalLots}</p></div>
    </div>
    {materials.length ? <section className="glass-panel rounded-3xl p-4 sm:p-6">
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative block"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={INPUT + " pl-10"} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search material name, code or description..." /></label>
        <select className={INPUT} aria-label="Filter raw materials by category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      {filtered.length ? <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {filtered.map(material => {
          const lots = purchaseLots.filter(lot => lot.materialId === material.id)
          const available = lots.reduce((sum, lot) => sum + lot.availableQty, 0)
          return <Panel key={material.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Wheat className="h-5 w-5" /></span>
              <span className="rounded-full border border-border px-3 py-1 text-[10px] font-extrabold">{material.code}</span>
            </div>
            <h3 className="mt-3 text-base font-black">{material.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{material.category || "Uncategorised"} · {material.unit}</p>
            {material.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{material.description}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div><p className="text-[11px] text-muted-foreground">Available stock</p><p className="mt-1 text-lg font-black">{number(available, 3)} <span className="text-xs font-bold text-muted-foreground">{material.unit}</span></p></div>
              <div><p className="text-[11px] text-muted-foreground">Purchase lots</p><p className="mt-1 text-lg font-black">{lots.length}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <button type="button" onClick={() => onEdit(material)} className={BUTTON + " border border-border bg-background/75"}><Pencil className="h-4 w-4" /> Edit</button>
              <button type="button" onClick={() => onDelete(material)} className={BUTTON + " border border-rose-500/25 bg-rose-500/5 text-rose-700 dark:text-rose-300"}><Trash2 className="h-4 w-4" /> Delete permanently</button>
            </div>
            {material.purchaseLotCount > 0 ? <p className="mt-2 text-[11px] text-muted-foreground">Deletion locked while {material.purchaseLotCount} linked purchase lot(s) are retained for traceability.</p> : null}
          </Panel>
        })}
      </div> : <Empty title="No matching raw materials" description="Try a different search or category filter." />}
    </section> : <Empty title="No raw materials added" description="Create raw-material records to build your ingredient and packaging catalogue." action={<button type="button" onClick={onAdd} className={BUTTON + " bg-primary text-primary-foreground"}>Add first raw material</button>} />}
  </div>
}

function FinishedStockModal({ data, initial, onClose, onSave }: { data: Snapshot; initial?: FinishedStock; onClose: () => void; onSave: (value: Record<string, string>) => Promise<boolean> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    const values: Record<string, string> = { type: "finished_stock" }
    new FormData(event.currentTarget).forEach((value, key) => { values[key] = String(value) })
    const success = await onSave(values)
    setSaving(false)
    if (!success) setError("The packet count could not be saved. Check the product, pack size and quantity.")
  }
  return <Modal title={initial ? "Update finished packet stock" : "Record finished packet stock"} description="Enter the physical count of sealed packets currently on hand." onClose={onClose}>
    <form onSubmit={submit} className="space-y-5">
      <label className="block"><span className={LABEL}>Product *</span><select className={INPUT} name="productId" required defaultValue={initial?.productId ?? ""}><option value="">Choose product</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.code}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={LABEL}>Packet size (grams) *</span><input className={INPUT} name="packSizeGrams" type="number" min="1" max="100000" step="1" required defaultValue={initial?.packSizeG ?? 200} placeholder="e.g. 200" /></label>
        <label className="block"><span className={LABEL}>Packets currently on hand *</span><input className={INPUT} name="packetsOnHand" type="number" min="0" step="1" required defaultValue={initial?.packetsOnHand ?? 0} placeholder="e.g. 84" /></label>
      </div>
      <label className="block"><span className={LABEL}>Stock note (optional)</span><input className={INPUT} name="notes" maxLength={500} defaultValue={initial?.notes ?? ""} placeholder="e.g. Counted after today's packing shift" /></label>
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm leading-6 text-muted-foreground">Enter the current physical count, not the historical production quantity. Record separate entries for 200 g, 500 g or other pack sizes.</div>
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button><button type="submit" disabled={saving || !data.products.length} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving..." : <><Check className="h-4 w-4" /> Save packet stock</>}</button></div>
    </form>
  </Modal>
}

function BatchModal({ data, onClose, onCreate, onAddPurchase }: { data: Snapshot; onClose: () => void; onCreate: (value: Record<string, unknown>) => Promise<boolean>; onAddPurchase: () => void }) {
  const [lines, setLines] = useState<Array<{ purchaseLotId: string; qtyUsed: string }>>([{ purchaseLotId: data.purchaseLots.find((lot) => lot.availableQty > 0)?.id ?? "", qtyUsed: "" }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const availableLots = data.purchaseLots.filter((lot) => lot.availableQty > 0.000001)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("")
    const form = new FormData(event.currentTarget)
    const value: Record<string, unknown> = {
      type: "batch", batchNo: String(form.get("batchNo") ?? ""), productId: String(form.get("productId") ?? ""),
      manufacturedOn: String(form.get("manufacturedOn") ?? ""), outputQtyKg: Number(form.get("outputQtyKg")),
      bestBefore: String(form.get("bestBefore") ?? ""), operatorName: String(form.get("operatorName") ?? ""),
      packagingLot: String(form.get("packagingLot") ?? ""), notes: String(form.get("notes") ?? ""),
      materials: lines.map((line) => ({ purchaseLotId: line.purchaseLotId, qtyUsed: Number(line.qtyUsed) })),
    }
    const success = await onCreate(value)
    setSaving(false)
    if (!success) setError("The batch was not saved. Check purchase-lot balances and required fields.")
  }
  return <Modal title="Register production batch" description="Record finished output and trace every ingredient to its vendor purchase lot." onClose={onClose} wide>
    <form onSubmit={submit} className="space-y-6">
      <div><p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-primary">01 · Production details</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Batch number" name="batchNo" required placeholder="e.g. SD-026" /><SelectField label="Product" name="productId" required><option value="">Choose product</option>{data.products.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}</SelectField><Field label="Manufacturing date" name="manufacturedOn" type="date" required /><Field label="Finished output (kg)" name="outputQtyKg" type="number" step="0.001" min="0.001" required placeholder="e.g. 250" /><Field label="Best-before date" name="bestBefore" type="date" /><Field label="Operator / supervisor" name="operatorName" placeholder="Name" /><Field label="Packaging lot" name="packagingLot" placeholder="Optional reference" /><label className="block sm:col-span-2 lg:col-span-3"><span className={LABEL}>Production notes</span><textarea name="notes" rows={2} className={INPUT + " min-h-24 resize-y"} placeholder="Process notes, yield observations, shift details..." /></label></div></div>
      <div className="border-t border-border pt-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-primary">02 · Ingredients consumed</p><p className="mt-1 text-xs text-muted-foreground">Choose the actual received purchase lot for each line.</p></div><button type="button" onClick={() => setLines((items) => [...items, { purchaseLotId: "", qtyUsed: "" }])} className={BUTTON + " border border-border bg-background/80"}><Plus className="h-4 w-4" /> Add material</button></div>
        <div className="space-y-3">{lines.map((line, index) => <div key={index} className="grid gap-3 rounded-2xl border border-border bg-background/55 p-3 sm:grid-cols-[minmax(0,1fr)_180px_48px] sm:items-end"><label className="block min-w-0"><span className={LABEL}>Purchase lot · material · vendor</span><select className={INPUT} required value={line.purchaseLotId} onChange={(event) => setLines((items) => items.map((item, i) => i === index ? { ...item, purchaseLotId: event.target.value } : item))}><option value="">Choose available lot</option>{availableLots.map((lot) => <option key={lot.id} value={lot.id}>{lot.materialName} · {lot.vendorName} · {number(lot.availableQty, 3)} {lot.unit} available</option>)}</select></label><label className="block"><span className={LABEL}>Quantity used</span><input className={INPUT} type="number" min="0.001" step="0.001" required value={line.qtyUsed} onChange={(event) => setLines((items) => items.map((item, i) => i === index ? { ...item, qtyUsed: event.target.value } : item))} placeholder="e.g. 120" /></label><button type="button" disabled={lines.length === 1} onClick={() => setLines((items) => items.filter((_, i) => i !== index))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-30" aria-label="Remove material line"><X className="h-4 w-4" /></button></div>)}</div>
        {!availableLots.length ? <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-amber-900 dark:text-amber-200">No available purchase lots yet. Add vendors, raw materials and a received purchase lot first.</p><button type="button" onClick={onAddPurchase} className={BUTTON + " shrink-0 bg-primary text-primary-foreground"}>Add purchase lot</button></div> : null}
      </div>
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button><button type="submit" disabled={saving || !data.products.length || !availableLots.length} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving batch..." : <><Check className="h-4 w-4" /> Save production batch</>}</button></div>
    </form>
    {!data.products.length ? <p className="mt-3 text-xs text-muted-foreground">Add a product first using Add master record.</p> : null}
  </Modal>
}

function EditBatchModal({ data, batch, onClose, onSave }: { data: Snapshot; batch: Batch; onClose: () => void; onSave: (value: Record<string, unknown>) => Promise<boolean> }) {
  const [lines, setLines] = useState<Array<{ purchaseLotId: string; qtyUsed: string; notes: string }>>(
    batch.materials.length
      ? batch.materials.map(line => ({ purchaseLotId: line.purchaseLotId, qtyUsed: String(line.qtyUsed), notes: line.notes ?? "" }))
      : [{ purchaseLotId: "", qtyUsed: "", notes: "" }],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const usedByThisBatch = (lotId: string) => batch.materials
    .filter(line => line.purchaseLotId === lotId)
    .reduce((total, line) => total + line.qtyUsed, 0)
  const missingLots: PurchaseLot[] = batch.materials
    .filter(line => !data.purchaseLots.some(lot => lot.id === line.purchaseLotId))
    .filter((line, index, rows) => rows.findIndex(item => item.purchaseLotId === line.purchaseLotId) === index)
    .map(line => ({
      id: line.purchaseLotId,
      materialId: line.materialId,
      materialName: line.materialName,
      unit: line.unit,
      vendorId: line.vendorId,
      vendorName: line.vendorName,
      vendorLotNumber: line.vendorLotNumber,
      invoiceNumber: line.invoiceNumber,
      purchasedOn: "",
      receivedQty: 0,
      usedQty: 0,
      availableQty: 0,
      unitCost: null,
    }))
  const lots: PurchaseLot[] = [...data.purchaseLots, ...missingLots]
  const availableLots = lots.filter(lot => lot.availableQty + usedByThisBatch(lot.id) > 0.000001)
  const availableAfterRestoringBatch = (lot: PurchaseLot) => lot.availableQty + usedByThisBatch(lot.id)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const value: Record<string, unknown> = {
      type: "batch_update",
      batchId: batch.id,
      batchNo: String(form.get("batchNo") ?? ""),
      productId: String(form.get("productId") ?? ""),
      manufacturedOn: String(form.get("manufacturedOn") ?? ""),
      outputQtyKg: Number(form.get("outputQtyKg")),
      bestBefore: String(form.get("bestBefore") ?? ""),
      operatorName: String(form.get("operatorName") ?? ""),
      packagingLot: String(form.get("packagingLot") ?? ""),
      notes: String(form.get("notes") ?? ""),
      materials: lines.map(line => ({
        purchaseLotId: line.purchaseLotId,
        qtyUsed: Number(line.qtyUsed),
        notes: line.notes,
      })),
    }
    const success = await onSave(value)
    setSaving(false)
    if (!success) setError("The batch was not updated. Check the fields and purchase-lot balances, then try again.")
  }

  return <Modal title={"Edit batch " + batch.batchNo} description="Correct production details and ingredient usage. Existing lot consumption is returned before the revised quantities are checked." onClose={onClose} wide>
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-3">
        <div><p className="text-xs font-bold text-muted-foreground">Current batch status</p><div className="mt-1"><StatusPill status={batch.status} /></div></div>
        <p className="max-w-md text-xs leading-5 text-muted-foreground">Editing does not change the batch status or its existing quality records.</p>
      </div>
      <div><p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-primary">01 · Production details</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block"><span className={LABEL}>Batch number *</span><input className={INPUT} name="batchNo" required maxLength={40} defaultValue={batch.batchNo} /></label>
        <label className="block"><span className={LABEL}>Product *</span><select className={INPUT} name="productId" required defaultValue={batch.productId}><option value="">Choose product</option>{data.products.filter(item => item.is_active || item.id === batch.productId).map(product => <option key={product.id} value={product.id}>{product.name} · {product.code}</option>)}</select></label>
        <label className="block"><span className={LABEL}>Manufacturing date *</span><input className={INPUT} name="manufacturedOn" type="date" required defaultValue={batch.manufacturedOn} /></label>
        <label className="block"><span className={LABEL}>Finished output (kg) *</span><input className={INPUT} name="outputQtyKg" type="number" min="0.001" step="0.001" required defaultValue={batch.outputQtyKg} /></label>
        <label className="block"><span className={LABEL}>Best-before date</span><input className={INPUT} name="bestBefore" type="date" defaultValue={batch.bestBefore ?? ""} /></label>
        <label className="block"><span className={LABEL}>Operator / supervisor</span><input className={INPUT} name="operatorName" maxLength={120} defaultValue={batch.operatorName ?? ""} /></label>
        <label className="block"><span className={LABEL}>Packaging lot</span><input className={INPUT} name="packagingLot" maxLength={80} defaultValue={batch.packagingLot ?? ""} /></label>
        <label className="block sm:col-span-2 lg:col-span-3"><span className={LABEL}>Production notes</span><textarea name="notes" rows={2} maxLength={1000} className={INPUT + " min-h-24 resize-y"} defaultValue={batch.notes ?? ""} /></label>
      </div></div>
      <div className="border-t border-border pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-primary">02 · Ingredients consumed</p><p className="mt-1 text-xs text-muted-foreground">The available amount shown includes this batch's existing consumption, which is returned when changes are saved.</p></div><button type="button" onClick={() => setLines(items => [...items, { purchaseLotId: "", qtyUsed: "", notes: "" }])} className={BUTTON + " border border-border bg-background/80"}><Plus className="h-4 w-4" /> Add material</button></div>
        <div className="space-y-3">{lines.map((line, index) => <div key={index} className="grid gap-3 rounded-2xl border border-border bg-background/55 p-3 sm:grid-cols-[minmax(0,1fr)_180px_48px] sm:items-end">
          <label className="block min-w-0"><span className={LABEL}>Purchase lot · material · vendor</span><select className={INPUT} required value={line.purchaseLotId} onChange={event => setLines(items => items.map((item, i) => i === index ? { ...item, purchaseLotId: event.target.value } : item))}><option value="">Choose purchase lot</option>{availableLots.map(lot => <option key={lot.id} value={lot.id}>{lot.materialName} · {lot.vendorName} · {number(availableAfterRestoringBatch(lot), 3)} {lot.unit} available</option>)}</select></label>
          <label className="block"><span className={LABEL}>Quantity used</span><input className={INPUT} type="number" min="0.001" step="0.001" required value={line.qtyUsed} onChange={event => setLines(items => items.map((item, i) => i === index ? { ...item, qtyUsed: event.target.value } : item))} placeholder="e.g. 120" /></label>
          <button type="button" disabled={lines.length === 1} onClick={() => setLines(items => items.filter((_, i) => i !== index))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-30" aria-label="Remove material line"><X className="h-4 w-4" /></button>
        </div>)}</div>
        {!availableLots.length ? <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">No purchase lots are currently available for this batch. Record a received lot before changing its ingredient lines.</p> : null}
      </div>
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className={BUTTON + " border border-border bg-background/70"}>Cancel</button><button type="submit" disabled={saving || !data.products.length || !availableLots.length} className={BUTTON + " bg-primary text-primary-foreground"}>{saving ? "Saving changes..." : <><Check className="h-4 w-4" /> Save batch changes</>}</button></div>
    </form>
  </Modal>
}

function BatchDetail({ batch, onClose, onEdit }: { batch: Batch; onClose: () => void; onEdit: () => void }) {
  return <Modal title={"Batch " + batch.batchNo} description={batch.productName + " · manufactured " + date(batch.manufacturedOn)} onClose={onClose} wide>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-secondary/65 p-4"><p className="text-xs font-bold text-muted-foreground">Finished output</p><p className="mt-1 text-2xl font-black">{number(batch.outputQtyKg, 2)} kg</p></div>
      <div className="rounded-2xl bg-secondary/65 p-4"><p className="text-xs font-bold text-muted-foreground">Batch status</p><div className="mt-2"><StatusPill status={batch.status} /></div></div>
      <div className="rounded-2xl bg-secondary/65 p-4"><p className="text-xs font-bold text-muted-foreground">Best before</p><p className="mt-1 text-lg font-bold">{date(batch.bestBefore)}</p></div>
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">Material traceability</h3><span className="text-xs text-muted-foreground">{batch.materials.length} lines</span></div>
        <div className="overflow-hidden rounded-2xl border border-border">
          {batch.materials.map(line => <div key={line.id} className="border-b border-border bg-background/50 p-4 last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold">{line.materialName}</p><p className="mt-1 text-xs text-muted-foreground">{line.vendorName} · lot {line.vendorLotNumber || "not specified"}</p></div><p className="font-mono text-sm font-extrabold">{number(line.qtyUsed, 3)} {line.unit}</p></div>
            <p className="mt-2 text-xs text-muted-foreground">Invoice: {line.invoiceNumber || "Not recorded"} · Lot ID: {line.purchaseLotId.slice(0, 8)}</p>
          </div>)}
          {!batch.materials.length ? <p className="p-4 text-sm text-muted-foreground">No material usage lines.</p> : null}
        </div>
      </div>
      <div className="rounded-2xl border border-border p-4">
        <h3 className="font-extrabold">Production notes</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{batch.notes || "No production notes."}</p>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <p>Operator: <span className="font-semibold text-foreground">{batch.operatorName || "—"}</span></p>
          <p>Packaging lot: <span className="font-semibold text-foreground">{batch.packagingLot || "—"}</span></p>
          <p>Created by: <span className="font-semibold text-foreground">{batch.createdBy}</span></p>
          <p>Updated: <span className="font-semibold text-foreground">{dateTime(batch.updatedAt)}</span></p>
        </div>
      </div>
    </div>
    <div className="mt-5 flex justify-end border-t border-border pt-4"><button type="button" onClick={onEdit} className={BUTTON + " bg-primary text-primary-foreground"}><Pencil className="h-4 w-4" /> Edit batch</button></div>
  </Modal>
}

function csvCell(value: unknown) {
  return '"' + String(value ?? "").replace(/"/g, '""') + '"'
}

export function InventoryWorkspace({ currentUserEmail }: { currentUserEmail: string }) {
  const [tab, setTab] = useState<TabId>("overview")
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [entity, setEntity] = useState<EntityKind | null>(null)
  const [editingMaster, setEditingMaster] = useState<EditableMaster | null>(null)
  const [deletingMaster, setDeletingMaster] = useState<DeletableMaster | null>(null)
  const [batchForm, setBatchForm] = useState(false)
  const [finishedStockForm, setFinishedStockForm] = useState<{ initial?: FinishedStock } | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [notice, setNotice] = useState("")

  const refresh = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true)
    try {
      const response = await fetch("/api/inventory", { cache: "no-store", credentials: "same-origin" })
      const payload = await response.json() as Snapshot & { error?: string }
      if (!response.ok) throw new Error(payload.error || "Could not load inventory.")
      setSnapshot(payload); setError("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not connect to inventory.")
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])
  useEffect(() => { void refresh() }, [refresh])

  const createRecord = useCallback(async (value: Record<string, string>) => {
    try {
      const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Save failed.")
      await refresh(true); setNotice("Record saved successfully."); setEntity(null); return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the record."); return false
    }
  }, [refresh])

  const saveMaster = useCallback(async (value: Record<string, string>) => {
    try {
      const response = await fetch("/api/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Update failed.")
      await refresh(true)
      setNotice("Record updated successfully.")
      setEditingMaster(null)
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the record.")
      return false
    }
  }, [refresh])

  const deleteMaster = useCallback(async (kind: "product" | "vendor" | "material", id: string) => {
    try {
      const response = await fetch("/api/inventory", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: kind, id }), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Delete failed.")
      await refresh(true)
      setNotice("Record permanently deleted.")
      setDeletingMaster(null)
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not permanently delete the record.")
      return false
    }
  }, [refresh])

  const saveVendorRate = useCallback(async (value: Record<string, string>) => {
    try {
      const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Vendor rate save failed.")
      await refresh(true)
      setNotice("Vendor rate saved and version history updated.")
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save vendor rate.")
      return false
    }
  }, [refresh])

  const saveFinishedStock = useCallback(async (value: Record<string, string>) => {
    try {
      const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Finished stock save failed.")
      await refresh(true)
      setNotice("Finished packet stock saved.")
      setFinishedStockForm(null)
      setTab("finished_stock")
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save finished packet stock.")
      return false
    }
  }, [refresh])

  const createBatch = useCallback(async (value: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Batch save failed.")
      await refresh(true); setNotice("Production batch registered."); setBatchForm(false); setTab("batches"); return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save batch."); return false
    }
  }, [refresh])

  const saveBatch = useCallback(async (value: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), credentials: "same-origin" })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || "Batch update failed.")
      await refresh(true)
      setNotice("Production batch updated successfully.")
      setEditingBatch(null)
      setSelectedBatch(null)
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the production batch.")
      return false
    }
  }, [refresh])

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (snapshot?.batches ?? []).filter((batch) => {
      const statusMatch = filter === "all" || batch.status === filter
      const queryMatch = !query || batch.batchNo.toLowerCase().includes(query) || batch.productName.toLowerCase().includes(query) || batch.materials.some((line) => line.materialName.toLowerCase().includes(query) || line.vendorName.toLowerCase().includes(query))
      return statusMatch && queryMatch
    })
  }, [snapshot, search, filter])

  const productOutput = useMemo(() => {
    const totals = new Map<string, number>()
    for (const batch of snapshot?.batches ?? []) totals.set(batch.productName, (totals.get(batch.productName) ?? 0) + batch.outputQtyKg)
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [snapshot])

  const navigate = (next: TabId) => { setTab(next); setSearch(""); setFilter("all") }
  const title = NAV.find((item) => item.id === tab)?.label ?? "Overview"

  const exportBatches = () => {
    if (!snapshot) return
    const rows: unknown[][] = [["Batch", "Product", "Date", "Output kg", "Status", "Material", "Vendor", "Qty used", "Unit", "Vendor lot", "Invoice"]]
    for (const batch of snapshot.batches) {
      if (!batch.materials.length) rows.push([batch.batchNo, batch.productName, batch.manufacturedOn, batch.outputQtyKg, batch.status, "", "", "", "", "", ""])
      else for (const line of batch.materials) rows.push([batch.batchNo, batch.productName, batch.manufacturedOn, batch.outputQtyKg, batch.status, line.materialName, line.vendorName, line.qtyUsed, line.unit, line.vendorLotNumber ?? "", line.invoiceNumber ?? ""])
    }
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "swadam-production-batches.csv"; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="ambient-bg min-h-screen text-foreground"><div className="mx-auto flex min-h-screen max-w-[1920px]">
    <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 flex-col border-r border-border/70 bg-card/55 px-4 py-5 backdrop-blur-2xl lg:flex">
      <div className="flex items-center gap-3 px-2"><Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={64} height={36} className="h-9 w-auto" priority /><div><p className="text-sm font-black">Swadam Foods</p><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Operations</p></div></div>
      <div className="my-6 h-px bg-border" /><p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
      <nav className="mt-3 flex-1 space-y-1" aria-label="Inventory navigation">{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => navigate(item.id)} className={"flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition " + (tab === item.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground")}><Icon className="h-[18px] w-[18px] shrink-0" /><span className="truncate">{item.label}</span></button> })}</nav>
      <div className="rounded-2xl border border-border bg-background/60 p-3"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-primary" /><span className="text-xs font-extrabold">Private workspace</span></div><p className="mt-1 break-all text-[10px] text-muted-foreground">{currentUserEmail}</p></div>
    </aside>

    <main className="min-w-0 flex-1">
      <header className="glass-header sticky top-0 z-30 border-x-0 border-t-0 px-4 py-3 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><Image src="/images/swadam-logo.webp" alt="Swadam Foods" width={48} height={28} className="h-7 w-auto" /></div><div className="min-w-0"><p className="truncate text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Operations workspace</p><p className="truncate text-sm font-bold text-foreground sm:text-base">{title}</p></div></div><div className="flex shrink-0 items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" /> Access verified</span><button type="button" onClick={() => void refresh(true)} disabled={refreshing} aria-label="Refresh inventory" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground hover:bg-secondary"><RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} /></button><ThemeToggle /><a href="/cdn-cgi/access/logout" className="hidden h-11 items-center rounded-full border border-border bg-background/70 px-4 text-xs font-bold text-muted-foreground hover:bg-secondary sm:inline-flex">Sign out</a></div></div></header>

      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Swadam Foods · Internal</p><h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Production records, raw-material sourcing and batch-level traceability in one place.</p></div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><button type="button" onClick={() => setEntity("product")} className={BUTTON + " flex-1 border border-border bg-card/75 text-foreground hover:bg-secondary sm:flex-none"}><Plus className="h-4 w-4" /> Add master record</button><button type="button" onClick={() => setBatchForm(true)} className={BUTTON + " flex-1 bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:opacity-90 sm:flex-none"}><Factory className="h-4 w-4" /> Add production batch</button></div></div>

        <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Inventory sections">{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => navigate(item.id)} className={"inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-bold " + (tab === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/65 text-muted-foreground")}><Icon className="h-4 w-4" />{item.label}</button> })}</nav>

        {notice ? <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" />{notice}<button type="button" className="ml-auto" onClick={() => setNotice("")} aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div> : null}
        {error ? <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0"><p className="font-extrabold">Inventory needs attention</p><p className="mt-1 leading-6">{error}</p>{error.toLowerCase().includes("database") ? <p className="mt-2 text-xs">Create and bind the separate inventory database. See INVENTORY_SETUP.md.</p> : null}</div><button type="button" className="ml-auto" onClick={() => setError("")} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div> : null}
        {loading && !snapshot ? <Panel className="flex min-h-64 items-center justify-center"><div className="text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary" /><p className="mt-3 text-sm font-semibold text-muted-foreground">Loading private inventory...</p></div></Panel> : null}

        {snapshot && tab === "overview" ? <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"><Metric label="Total production" value={number(snapshot.stats.totalOutputKg) + " kg"} detail="Recorded finished output" icon={Factory} /><Metric label="Batches recorded" value={number(snapshot.stats.totalBatches, 0)} detail="All production history" icon={Boxes} /><Metric label="This month" value={number(snapshot.stats.monthOutputKg) + " kg"} detail={number(snapshot.stats.monthBatches, 0) + " batches manufactured"} icon={CalendarDays} /><Metric label="Open batches" value={number(snapshot.stats.qcPending, 0)} detail="Batches not yet released" icon={Factory} /></div>
          <div className="grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
            <Panel><Heading title="Production by product" description="Output across the latest 200 batches." />{productOutput.length ? <div className="space-y-5">{productOutput.map(([name, qty]) => { const max = Math.max(...productOutput.map((entry) => entry[1]), 1); return <div key={name}><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-sm font-bold">{name}</span><span className="shrink-0 font-mono text-sm font-extrabold">{number(qty)} kg</span></div><div className="h-2.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: (qty / max * 100) + "%" }} /></div></div>})}</div> : <Empty title="No production yet" description="Add your first production batch to begin building production history." action={<button type="button" onClick={() => setBatchForm(true)} className={BUTTON + " bg-primary text-primary-foreground"}>Add first batch</button>} />}</Panel>
            <Panel><Heading title="Quick overview" description="Your inventory setup at a glance." /><div className="grid grid-cols-2 gap-3">{[[Package, snapshot.products.length, "Products"], [Truck, snapshot.vendors.length, "Vendors"], [Wheat, snapshot.materials.length, "Raw materials"], [Boxes, snapshot.purchaseLots.length, "Purchase lots"]].map(([Icon, count, label], index) => { const ItemIcon = Icon as typeof Package; return <div key={index} className="rounded-2xl bg-secondary/65 p-4"><ItemIcon className="h-5 w-5 text-primary" /><p className="mt-3 text-2xl font-black">{count as number}</p><p className="text-xs font-semibold text-muted-foreground">{label as string}</p></div> })}</div><div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4"><div className="flex items-center gap-2 text-primary"><LockKeyhole className="h-4 w-4" /><p className="text-xs font-extrabold">Traceability principle</p></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Every ingredient line links to its received purchase lot, preserving the actual vendor and invoice reference.</p></div></Panel>
          </div>
          <Panel><Heading title="Recently recorded batches" description="Latest production activity." action={<button type="button" onClick={() => navigate("batches")} className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-extrabold text-primary hover:bg-primary/10">View all <ArrowRight className="h-4 w-4" /></button>} />{snapshot.batches.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3">Batch</th><th className="px-3 py-3">Product</th><th className="px-3 py-3">Manufactured</th><th className="px-3 py-3">Output</th><th className="px-3 py-3">Materials</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{snapshot.batches.slice(0, 6).map((batch) => <tr key={batch.id} onClick={() => setSelectedBatch(batch)} className="cursor-pointer border-b border-border/70 text-sm transition hover:bg-secondary/45 last:border-0"><td className="px-3 py-4 font-mono text-xs font-extrabold">{batch.batchNo}</td><td className="px-3 py-4 font-bold">{batch.productName}</td><td className="px-3 py-4 text-muted-foreground">{date(batch.manufacturedOn)}</td><td className="px-3 py-4 font-mono font-bold">{number(batch.outputQtyKg, 2)} kg</td><td className="px-3 py-4 text-muted-foreground">{batch.materials.length} lines</td><td className="px-3 py-4"><StatusPill status={batch.status} /></td></tr>)}</tbody></table></div> : <Empty title="Your production ledger is ready" description="Register a batch to track output, ingredients, suppliers and quality decisions." />}</Panel>
          <p className="text-center text-[11px] text-muted-foreground">Dashboard totals include all records. Product breakdown uses the latest 200 batches.</p>
        </div> : null}

        {snapshot && tab === "batches" ? <Panel><Heading title="Production ledger" description="Search by batch, product, ingredient or vendor. Select a row for full traceability." action={<button type="button" onClick={exportBatches} className={BUTTON + " border border-border bg-background/70"}><ArrowDownToLine className="h-4 w-4" /> Export CSV</button>} /><div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]"><label className="relative block"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={INPUT + " pl-10"} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batch, product, material or vendor..." /></label><label className="relative block"><Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><select className={INPUT + " pl-10"} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="in_progress">In production</option><option value="qc_hold">QC hold</option><option value="released">Released</option><option value="rejected">Rejected</option></select></label></div>{filteredBatches.length ? <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[850px] text-left"><thead className="bg-secondary/55"><tr className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><th className="px-4 py-3">Batch number</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Output</th><th className="px-4 py-3">Vendors</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{filteredBatches.map((batch) => <tr key={batch.id} onClick={() => setSelectedBatch(batch)} className="cursor-pointer border-t border-border/70 text-sm transition hover:bg-primary/5"><td className="px-4 py-4 font-mono text-xs font-extrabold">{batch.batchNo}</td><td className="px-4 py-4 font-bold">{batch.productName}</td><td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{date(batch.manufacturedOn)}</td><td className="whitespace-nowrap px-4 py-4 font-mono font-bold">{number(batch.outputQtyKg, 2)} kg</td><td className="px-4 py-4 text-muted-foreground">{new Set(batch.materials.map((line) => line.vendorId)).size}</td><td className="px-4 py-4"><StatusPill status={batch.status} /></td></tr>)}</tbody></table></div> : <Empty title="No matching batches" description="Try another search or create a new production batch." action={<button type="button" onClick={() => setBatchForm(true)} className={BUTTON + " bg-primary text-primary-foreground"}>Add batch</button>} />}<p className="mt-3 text-xs text-muted-foreground">Showing {filteredBatches.length} of up to 200 most recent batches.</p></Panel> : null}

        {snapshot && tab === "products" ? <div className="space-y-4"><Heading title="Product catalogue" description="Edit product details or permanently delete products that have no production history." action={<button type="button" onClick={() => setEntity("product")} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Add product</button>} />{snapshot.products.length ? <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{snapshot.products.map((product) => <Panel key={product.id}><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Package className="h-5 w-5" /></span><span className="rounded-full border border-border px-3 py-1 text-[10px] font-extrabold text-muted-foreground">{product.code}</span></div><h3 className="mt-4 text-lg font-black">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.category || "Uncategorised"}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{product.description || "No description recorded."}</p><div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3"><button type="button" onClick={() => setEditingMaster({kind:"product",record:product})} className={BUTTON + " border border-border bg-background/75"}><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => setDeletingMaster({kind:"product",record:product})} className={BUTTON + " border border-rose-500/25 bg-rose-500/5 text-rose-700 dark:text-rose-300"}><Trash2 className="h-4 w-4" /> Delete permanently</button></div>{product.batchCount > 0 ? <p className="mt-2 text-[11px] text-muted-foreground">{product.batchCount} production batch(es) linked · deletion blocked to preserve traceability.</p> : null}</Panel>)}</div> : <Empty title="No products added" description="Create your product catalogue before registering production." action={<button type="button" onClick={() => setEntity("product")} className={BUTTON + " bg-primary text-primary-foreground"}>Add first product</button>} />}</div> : null}

        {snapshot && tab === "finished_stock" ? <div className="space-y-4">
          <Heading title="Finished packet stock" description="Manually track sealed packets physically on hand, separately for each product and pack size." action={<button type="button" onClick={() => setFinishedStockForm({})} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Record packet stock</button>} />
          {snapshot.finishedStock.length ? <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{snapshot.finishedStock.map((stock) => <Panel key={stock.id}>
            <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Package className="h-5 w-5" /></span><span className="rounded-full border border-border px-3 py-1 text-[10px] font-extrabold text-muted-foreground">{stock.productCode}</span></div>
            <h3 className="mt-4 text-lg font-black">{stock.productName}</h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{number(stock.packSizeG, 0)} g packet</p>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-3"><div><p className="text-xs text-muted-foreground">Packets on hand</p><p className="text-3xl font-black tabular-nums">{number(stock.packetsOnHand, 0)}</p></div><button type="button" onClick={() => setFinishedStockForm({ initial: stock })} className={BUTTON + " border border-border bg-background/75"}>Update count</button></div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Updated {dateTime(stock.updatedAt)} by {stock.updatedBy}{stock.notes ? " · " + stock.notes : ""}</p>
          </Panel>)}</div> : <Empty title="No finished packet stock recorded" description="Add a product, choose its packet size (for example 200 g), and enter the number of sealed packets you physically have." action={<button type="button" onClick={() => setFinishedStockForm({})} disabled={!snapshot.products.length} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Record first packet count</button>} />}
        </div> : null}

        {snapshot && tab === "vendors" ? <div className="space-y-4"><Heading title="Vendor directory" description="Edit suppliers or permanently remove vendors whose purchase lots have not been used." action={<button type="button" onClick={() => setEntity("vendor")} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Add vendor</button>} />{snapshot.vendors.length ? <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{snapshot.vendors.map((vendor) => <Panel key={vendor.id}><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Truck className="h-5 w-5" /></span><span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold">{vendor.purchaseLotCount} purchase lots</span></div><h3 className="mt-4 text-lg font-black">{vendor.name}</h3><p className="mt-1 text-sm text-muted-foreground">{vendor.contact_name || "Contact not recorded"}</p><div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground"><p>{vendor.phone || "Phone not recorded"}</p><p>{vendor.email || "Email not recorded"}</p><p>{vendor.gstin ? "GSTIN: " + vendor.gstin : "GSTIN not recorded"}</p><p>{vendor.address || "Address not recorded"}</p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3"><button type="button" onClick={() => setEditingMaster({kind:"vendor",record:vendor})} className={BUTTON + " border border-border bg-background/75"}><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => setDeletingMaster({kind:"vendor",record:vendor})} className={BUTTON + " border border-rose-500/25 bg-rose-500/5 text-rose-700 dark:text-rose-300"}><Trash2 className="h-4 w-4" /> Delete permanently</button></div>{vendor.usedPurchaseLotCount > 0 ? <p className="mt-2 text-[11px] text-muted-foreground">{vendor.usedPurchaseLotCount} consumed lot(s) linked · deletion blocked to preserve traceability.</p> : null}</Panel>)}</div> : <Empty title="No vendors added" description="Add suppliers so every purchase lot can be attributed to the correct vendor." action={<button type="button" onClick={() => setEntity("vendor")} className={BUTTON + " bg-primary text-primary-foreground"}>Add first vendor</button>} />}</div> : null}

        {snapshot && tab === "vendor_rates" ? <VendorRatesPanel vendors={snapshot.vendors} materials={snapshot.materials} rates={snapshot.vendorRates} versions={snapshot.vendorRateVersions} onSave={saveVendorRate} /> : null}

        {snapshot && tab === "raw_materials" ? <RawMaterialsPanel materials={snapshot.materials} purchaseLots={snapshot.purchaseLots} onAdd={() => setEntity("material")} onEdit={material => setEditingMaster({kind:"material",record:material})} onDelete={material => setDeletingMaster({kind:"material",record:material})} /> : null}

        {snapshot && tab === "materials" ? <div className="space-y-5"><Heading title="Materials & purchase lots" description="Received quantities, consumption and remaining lot balances." action={<button type="button" onClick={() => setEntity("purchase_lot")} className={BUTTON + " bg-primary text-primary-foreground"}><Plus className="h-4 w-4" /> Receive material</button>} /><Panel><Heading title="Received purchase lots" description="The supplier consignments that production batches consume." />{snapshot.purchaseLots.length ? <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[900px] text-left"><thead className="bg-secondary/55"><tr className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><th className="px-4 py-3">Material</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Purchased</th><th className="px-4 py-3">Vendor lot</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Invoice</th></tr></thead><tbody>{snapshot.purchaseLots.map((lot) => <tr key={lot.id} className="border-t border-border/70 text-sm"><td className="px-4 py-4 font-bold">{lot.materialName}</td><td className="px-4 py-4">{lot.vendorName}</td><td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{date(lot.purchasedOn)}</td><td className="px-4 py-4 text-muted-foreground">{lot.vendorLotNumber || "—"}</td><td className="px-4 py-4 font-mono">{number(lot.receivedQty, 3)} {lot.unit}</td><td className="px-4 py-4 font-mono">{number(lot.usedQty, 3)} {lot.unit}</td><td className="px-4 py-4 font-mono font-extrabold">{number(lot.availableQty, 3)} {lot.unit}</td><td className="px-4 py-4 text-muted-foreground">{lot.invoiceNumber || "—"}</td></tr>)}</tbody></table></div> : <Empty title="No purchase lots yet" description="Record a received lot to connect materials with vendors and track available quantities." action={<button type="button" onClick={() => setEntity("purchase_lot")} className={BUTTON + " bg-primary text-primary-foreground"}>Receive a purchase lot</button>} />}</Panel></div> : null}

        {snapshot && tab === "activity" ? <Panel><Heading title="Activity history" description="An append-only record of who created and updated inventory and production records." />{snapshot.activity.length ? <div className="space-y-1">{snapshot.activity.map((entry) => <div key={entry.id} className="flex flex-wrap items-start gap-3 border-b border-border/70 py-4 last:border-0"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Activity className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{entry.summary}</p><p className="mt-1 break-all text-xs text-muted-foreground">{entry.actor} · {entry.action} · {entry.entityType} · {entry.entityId.slice(0, 10)}</p></div><time className="text-xs text-muted-foreground">{dateTime(entry.createdAt)}</time></div>)}</div> : <Empty title="No activity recorded" description="Changes will appear here as inventory records are added." />}</Panel> : null}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-[11px] text-muted-foreground"><span>Swadam Foods · Private production records</span><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" /> Cloudflare Access protected</span></footer>
      </div>
    </main>
  </div>
  {entity && snapshot ? <EntityModal initialKind={entity} data={snapshot} onClose={() => setEntity(null)} onCreate={createRecord} /> : null}
  {editingMaster ? <EditMasterModal target={editingMaster} onClose={() => setEditingMaster(null)} onSave={saveMaster} /> : null}
  {deletingMaster ? <DeleteMasterModal target={deletingMaster} onClose={() => setDeletingMaster(null)} onDelete={deleteMaster} /> : null}
  {batchForm && snapshot ? <BatchModal data={snapshot} onClose={() => setBatchForm(false)} onCreate={createBatch} onAddPurchase={() => { setBatchForm(false); setEntity("purchase_lot") }} /> : null}
  {editingBatch && snapshot ? <EditBatchModal data={snapshot} batch={editingBatch} onClose={() => setEditingBatch(null)} onSave={saveBatch} /> : null}
  {finishedStockForm && snapshot ? <FinishedStockModal data={snapshot} initial={finishedStockForm.initial} onClose={() => setFinishedStockForm(null)} onSave={saveFinishedStock} /> : null}
  {selectedBatch && snapshot ? <BatchDetail batch={snapshot.batches.find((item) => item.id === selectedBatch.id) ?? selectedBatch} onClose={() => setSelectedBatch(null)} onEdit={() => { const current = snapshot.batches.find((item) => item.id === selectedBatch.id) ?? selectedBatch; setSelectedBatch(null); setEditingBatch(current) }} /> : null}
  </div>
}
