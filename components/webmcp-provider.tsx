"use client"

import { useEffect } from "react"
import { products } from "@/lib/products"

interface WebMCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

declare global {
  interface Navigator {
    modelContext?: {
      provideContext?: (context: { tools?: WebMCPTool[] }) => void
      registerTool?: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => void
      tools?: Map<string, WebMCPTool>
    }
  }
}

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const tools: WebMCPTool[] = [
      {
        name: "getProducts",
        description:
          "Retrieve the list of authentic Maharashtrian snacks and instant breakfast premixes available from Swadam Foods, including prices, pack weights, and descriptions.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Optional filter category (e.g., snacks, premixes)"
            }
          }
        },
        execute: async () => {
          return {
            products: products.map((p) => ({
              id: p.id,
              name: p.name,
              weight: p.weight,
              price: p.price,
              currency: "INR",
              tagline: p.tagline,
              badge: p.badge
            }))
          }
        }
      },
      {
        name: "calculateOrderTotal",
        description: "Calculate the total cost of an order including products and standard Pune delivery.",
        inputSchema: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number", minimum: 1 }
                }
              }
            },
            deliveryMethod: {
              type: "string",
              enum: ["pune_standard", "porter_express"],
              default: "pune_standard"
            }
          }
        },
        execute: async (args) => {
          const items = (args.items as Array<{ productId: string; quantity: number }>) || []
          let subtotal = 0
          for (const item of items) {
            const prod = products.find((p) => p.id === item.productId)
            if (prod) {
              subtotal += prod.price * item.quantity
            }
          }
          const deliveryCost = args.deliveryMethod === "porter_express" ? 0 : 50
          return {
            subtotal,
            deliveryCost,
            total: subtotal + deliveryCost,
            currency: "INR"
          }
        }
      },
      {
        name: "checkOrderStatus",
        description: "Check the real-time preparation or delivery status of a Swadam Foods order by its order ID.",
        inputSchema: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: {
              type: "string",
              description: "The order ID (e.g., SWD-20260908-12345678)"
            }
          }
        },
        execute: async (args) => {
          const orderId = String(args.orderId || "")
          try {
            const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)
            if (!res.ok) {
              return { found: false, message: "Order not found" }
            }
            const data = await res.json()
            return { found: true, order: data }
          } catch {
            return { found: false, message: "Failed to fetch order status" }
          }
        }
      }
    ]

    // Initialize navigator.modelContext polyfill/shim if not natively present
    if (!navigator.modelContext) {
      const toolMap = new Map<string, WebMCPTool>()
      tools.forEach((t) => toolMap.set(t.name, t))

      navigator.modelContext = {
        tools: toolMap,
        provideContext: (context) => {
          if (context.tools) {
            context.tools.forEach((tool) => toolMap.set(tool.name, tool))
          }
        },
        registerTool: (tool) => {
          toolMap.set(tool.name, tool)
        }
      }
    }

    // Call provideContext() per WebMCP standard
    if (typeof navigator.modelContext.provideContext === "function") {
      try {
        navigator.modelContext.provideContext({ tools })
      } catch (e) {
        console.warn("WebMCP provideContext error:", e)
      }
    }

    // Call registerTool() for each tool per Chrome WebMCP EPP draft
    if (typeof navigator.modelContext.registerTool === "function") {
      tools.forEach((tool) => {
        try {
          navigator.modelContext?.registerTool?.(tool)
        } catch (e) {
          console.warn("WebMCP registerTool error:", e)
        }
      })
    }

    // Expose on window for easy inspection & verification
    ;(window as unknown as { webmcpTools: WebMCPTool[] }).webmcpTools = tools
  }, [])

  return null
}
