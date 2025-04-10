"use client"

import { useEffect } from "react"

export function ThemeScript() {
  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    initializeTheme()

    // Listen for theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", initializeTheme)

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", initializeTheme)
    }
  }, [])

  return null
}
