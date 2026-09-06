"use client"

import { useEffect } from "react"
import { products } from "@/lib/products"

type ModelContext = {
  registerTool: (tool: {
    name: string
    description: string
    inputSchema: Record<string, unknown>
    annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean }
    execute: (input: any) => Promise<unknown> | unknown
  }, options?: { signal?: AbortSignal }) => Promise<unknown> | unknown
}

export function WebMCPTools() {
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext
    if (!modelContext?.registerTool) return

    const registeredTools = [
      {
        name: "list_swadam_foods_products",
        description: "List the currently published Swadam Foods products with pack sizes and prices.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: async () => JSON.stringify(products.map(({ id, name, weight, price, badge }) => ({ id, name, weight, price, currency: "INR", badge: badge ?? null }))),
      },
      {
        name: "get_swadam_foods_product",
        description: "Get details and preparation instructions for a Swadam Foods product by product ID.",
        inputSchema: {
          type: "object",
          properties: { productId: { type: "string", description: "Product ID, such as kanda-poha-premix." } },
          required: ["productId"],
        },
        annotations: { readOnlyHint: true },
        execute: async ({ productId }: { productId: string }) => {
          const product = products.find((item) => item.id === productId)
          if (!product) return `Product not found: ${productId}`
          return JSON.stringify(product)
        },
      },
      {
        name: "open_swadam_foods_ordering",
        description: "Open the Swadam Foods WhatsApp ordering conversation after the user has decided to order.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: false, consequentialHint: true },
        execute: async () => {
          window.open("https://wa.me/918888851522", "_blank", "noopener,noreferrer")
          return "Opened the Swadam Foods WhatsApp ordering conversation."
        },
      },
    ]

    const controllers: AbortController[] = []
    for (const tool of registeredTools) {
      const controller = new AbortController()
      controllers.push(controller)
      Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })).catch(() => {})
    }

    return () => controllers.forEach((controller) => controller.abort())
  }, [])

  return null
}
