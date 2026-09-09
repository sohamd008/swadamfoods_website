"use client"

import { useEffect } from "react"

export function SecurityProtection() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName.toUpperCase()
        const isInput = tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable
        if (!isInput) {
          e.preventDefault()
        }
      } else {
        e.preventDefault()
      }
    }

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName.toUpperCase() === "IMG" || target.closest("picture") || target.closest("img"))) {
        e.preventDefault()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      if (
        cmdOrCtrl &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault()
        return false
      }

      if (cmdOrCtrl && (e.key === "U" || e.key === "u")) {
        e.preventDefault()
        return false
      }

      if (cmdOrCtrl && (e.key === "S" || e.key === "s")) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("contextmenu", handleContextMenu, { capture: true })
    document.addEventListener("dragstart", handleDragStart, { capture: true })
    window.addEventListener("keydown", handleKeyDown, { capture: true })

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true })
      document.removeEventListener("dragstart", handleDragStart, { capture: true })
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
    }
  }, [])

  return null
}
