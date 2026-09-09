import type { SVGProps } from "react"

export function PhonePeIcon({ className = "h-5 w-5", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PhonePe"
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="#5F259F" />
      <g transform="translate(6, 6) scale(1.5)">
        <path
          fill="#FFFFFF"
          d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243 1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z"
        />
      </g>
    </svg>
  )
}

export function PhonePeLogo({ className = "h-6 w-auto", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-sans font-bold tracking-tight select-none ${className}`}>
      <PhonePeIcon className="h-6 w-6 shrink-0" />
      <span className="text-base font-extrabold tracking-tight">
        <span className={dark ? "text-white" : "text-[#5F259F] dark:text-purple-300"}>Phone</span>
        <span className={dark ? "text-purple-300" : "text-[#5F259F] dark:text-purple-200"}>Pe</span>
      </span>
    </span>
  )
}

export function PhonePeSecurityBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent px-3.5 py-2 backdrop-blur-md dark:border-purple-500/20 ${className}`}
    >
      <PhonePeIcon className="h-5 w-5 shrink-0" />
      <div className="flex flex-col text-left leading-none">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F259F] dark:text-purple-300">
          Secured by PhonePe
        </span>
        <span className="mt-0.5 text-[9px] font-medium text-muted-foreground">
          UPI · QR · Cards · NetBanking
        </span>
      </div>
    </div>
  )
}
