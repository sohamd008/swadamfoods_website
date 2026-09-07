"use client"

import dynamic from "next/dynamic"
import { useCart } from "@/lib/cart-context"

const CartDrawer = dynamic(() => import("@/components/cart-drawer").then((mod) => mod.CartDrawer), {
  ssr: false,
  loading: () => null,
})

export function CartDrawerGate() {
  const { isOpen } = useCart()
  return isOpen ? <CartDrawer /> : null
}
