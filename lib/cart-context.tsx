"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Product } from "@/lib/products"
import { products } from "@/lib/products"
import { trackEvent } from "@/lib/analytics"

export type CartItem = {
  product: Product
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_STORAGE_KEY = "swadam-foods-cart"
const MAX_ITEM_QUANTITY = 20
const productById = new Map(products.map((product) => [product.id, product]))

function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const candidate = item as { product?: { id?: unknown }; quantity?: unknown }
      const productId = typeof candidate.product?.id === "string" ? candidate.product.id : ""
      const product = productById.get(productId)
      const quantity = typeof candidate.quantity === "number" && Number.isFinite(candidate.quantity)
        ? Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(candidate.quantity)))
        : 0
      return product && quantity > 0 ? { product, quantity } : null
    })
    .filter((item): item is CartItem => item !== null)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hasLoadedCart, setHasLoadedCart] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY)
      if (stored) setItems(normalizeCart(JSON.parse(stored)))
    } catch {
      setItems([])
    } finally {
      setHasLoadedCart(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedCart) return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [hasLoadedCart, items])

  function addItem(product: Product) {
    setItems((previous) => {
      const existing = previous.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= MAX_ITEM_QUANTITY) return previous
        return previous.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...previous, { product, quantity: 1 }]
    })
    trackEvent("add_to_cart", {
      currency: "INR",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1, item_brand: "Swadam Foods" }],
    })
    setIsOpen(true)
  }

  function removeItem(productId: string) {
    setItems((previous) => {
      const found = previous.find((item) => item.product.id === productId)
      if (found) {
        trackEvent("remove_from_cart", {
          currency: "INR",
          value: found.product.price * found.quantity,
          items: [{ item_id: found.product.id, item_name: found.product.name, price: found.product.price, quantity: found.quantity, item_brand: "Swadam Foods" }],
        })
      }
      return previous.filter((item) => item.product.id !== productId)
    })
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const nextQuantity = Math.min(MAX_ITEM_QUANTITY, Math.floor(quantity))
    setItems((previous) => previous.map((item) => item.product.id === productId ? { ...item, quantity: nextQuantity } : item))
  }

  const { totalItems, totalPrice } = useMemo(
    () => items.reduce(
      (totals, item) => ({
        totalItems: totals.totalItems + item.quantity,
        totalPrice: totals.totalPrice + item.quantity * item.product.price,
      }),
      { totalItems: 0, totalPrice: 0 },
    ),
    [items],
  )

  const value: CartContextValue = {
    items,
    isOpen,
    totalItems,
    totalPrice,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    setQuantity,
    clear: () => setItems([]),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
