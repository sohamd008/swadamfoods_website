"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          action?: string
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: (error?: unknown) => void
          theme?: "light" | "dark" | "auto"
          size?: "normal" | "compact" | "flexible"
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoaded?: () => void
  }
}

export type TurnstileRef = {
  reset: () => void
}

type TurnstileProps = {
  siteKey?: string
  action?: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error?: unknown) => void
  className?: string
  theme?: "light" | "dark" | "auto"
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  {
    siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEtsa_dcINgLL2jR",
    action = "checkout",
    onVerify,
    onExpire,
    onError,
    className = "",
    theme = "auto",
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }),
    [],
  )

  useEffect(() => {
    let isMounted = true

    function renderWidget() {
      if (!isMounted || !containerRef.current || !window.turnstile) return
      if (widgetIdRef.current) return

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme,
          callback: (token: string) => {
            if (isMounted) onVerify(token)
          },
          "expired-callback": () => {
            if (isMounted && onExpire) onExpire()
          },
          "error-callback": (err?: unknown) => {
            if (isMounted && onError) onError(err)
          },
        })
        widgetIdRef.current = id
      } catch (err) {
        if (onError) onError(err)
      }
    }

    const SCRIPT_ID = "cf-turnstile-script"
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (window.turnstile) {
      renderWidget()
    } else if (existingScript) {
      existingScript.addEventListener("load", renderWidget)
    } else {
      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    }

    return () => {
      isMounted = false
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey, action, theme, onVerify, onExpire, onError])

  return (
    <div
      ref={containerRef}
      className={`min-h-[65px] flex items-center justify-center ${className}`}
    />
  )
})
