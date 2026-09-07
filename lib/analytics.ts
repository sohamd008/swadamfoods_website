export type AnalyticsEvent =
  | "view_item"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event",
      target: string,
      params?: Record<string, unknown>,
    ) => void
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", event, params)
}
