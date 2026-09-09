export type AnalyticsEvent =
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "purchase"

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

export type GA4Item = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_brand?: string
  item_category?: string
}
