"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ChefHat,
  Box,
  MessageSquare,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react"

type OrderItem = {
  productName: string
  weight: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

type OrderDetails = {
  id: string
  customerName: string
  customerPhoneMasked: string
  customerAddress: string
  pincode: string
  deliveryMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const MERCHANT_WHATSAPP = "8888851522"

const STAGES = [
  { id: "received", label: "Order Received", icon: Clock, desc: "Order details received" },
  { id: "paid", label: "Payment Confirmed", icon: CheckCircle2, desc: "Secure payment verified" },
  { id: "preparing", label: "Preparing Fresh", icon: ChefHat, desc: "Delicacies being handcrafted" },
  { id: "packed", label: "Packed", icon: Box, desc: "Sealed & ready for dispatch" },
  { id: "shipped", label: "Out for Delivery", icon: Truck, desc: "Delivery partner on the way" },
  { id: "delivered", label: "Delivered", icon: Sparkles, desc: "Enjoy your Swadam Foods!" },
]

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Order not found.")
        return
      }
      setOrder(data.order)
      setError("")
    } catch {
      setError("Failed to connect to server.")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [fetchOrder])

  const getStageIndex = (orderStatus: string, paymentStatus: string) => {
    if (orderStatus === "delivered") return 5
    if (orderStatus === "shipped") return 4
    if (orderStatus === "packed") return 3
    if (orderStatus === "preparing") return 2
    if (paymentStatus === "paid" || orderStatus === "accepted") return 1
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0503] text-amber-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3 text-amber-300">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium">Loading live order status...</span>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0a0503] text-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#140b07] border border-amber-900/40 rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-amber-100">Order Not Found</h2>
          <p className="text-xs text-amber-300/70">{error || "Please check your order ID and try again."}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Swadam Foods</span>
          </Link>
        </div>
      </div>
    )
  }

  const currentStageIdx = getStageIndex(order.orderStatus, order.paymentStatus)
  const isCancelled = order.orderStatus === "cancelled"

  const whatsappMessage = encodeURIComponent(
    `Namaste Swadam Foods! 🙏 I have a question about my order *${order.id}* (Total: ₹${order.total}).`,
  )

  return (
    <div className="min-h-screen bg-[#0a0503] text-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400/80 hover:text-amber-300 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800/30 px-3.5 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>

          <span className="text-xs font-mono text-amber-500/60">
            Updated: {new Date(order.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Order Header Card */}
        <div className="bg-[#140b07]/90 backdrop-blur-xl border border-amber-900/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/30">
            <div>
              <span className="text-[10px] text-amber-500/70 uppercase tracking-widest font-semibold block mb-1">
                Live Order Tracker
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-amber-100">{order.id}</h1>
              <p className="text-xs text-amber-300/60 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs text-amber-300/70">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">₹{order.total}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}>
                {order.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Pending"}
              </span>
            </div>
          </div>

          {/* Visual Progress Timeline */}
          <div className="pt-2">
            {isCancelled ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center text-rose-300 text-sm">
                This order has been cancelled. If you have questions, please chat with us on WhatsApp.
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xs font-semibold text-amber-200/80 uppercase tracking-wider">
                  Live Order Progress
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-900/40">
                  {STAGES.map((stage, idx) => {
                    const isPassed = idx <= currentStageIdx
                    const isCurrent = idx === currentStageIdx
                    const Icon = stage.icon

                    return (
                      <div key={stage.id} className="relative flex items-start space-x-4">
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isPassed
                              ? "bg-emerald-500 border-emerald-400 text-amber-950 shadow-md shadow-emerald-500/30"
                              : "bg-[#140b07] border-amber-900/60 text-amber-900"
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${isPassed ? "text-amber-950 font-bold" : "text-amber-700"}`} />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold ${isPassed ? "text-amber-100" : "text-amber-600"}`}>
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-400/60 mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Items Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Details */}
          <div className="bg-[#140b07]/80 backdrop-blur-md border border-amber-900/30 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivery Details</span>
            </h3>
            <div className="text-xs space-y-1.5 text-amber-300/80">
              <p><strong className="text-amber-100">{order.customerName}</strong></p>
              <p>{order.customerPhoneMasked}</p>
              <p className="text-amber-300/70">{order.customerAddress} - <strong className="text-amber-200">{order.pincode}</strong></p>
              <p className="pt-2 text-[11px] text-amber-400 font-medium">
                Delivery Method: <span className="uppercase font-bold text-amber-200">{order.deliveryMethod}</span>
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-[#140b07]/80 backdrop-blur-md border border-amber-900/30 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Items in Order</span>
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto text-xs pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-amber-200/90 py-1 border-b border-amber-900/20 last:border-0">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-[10px] text-amber-500/70 ml-1.5">({item.weight})</span>
                  </div>
                  <div className="font-mono text-amber-200">
                    {item.quantity} x ₹{item.unitPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp Customer Action Bar */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border border-emerald-800/40 rounded-3xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-200">Have questions about your order?</h3>
            <p className="text-xs text-emerald-300/70 mt-1 max-w-md mx-auto">
              Our team at Swadam Foods is ready to help you directly on WhatsApp Business.
            </p>
          </div>

          <a
            href={`https://wa.me/91${MERCHANT_WHATSAPP}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition"
          >
            <span>Chat on WhatsApp (+91 {MERCHANT_WHATSAPP})</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  )
}
