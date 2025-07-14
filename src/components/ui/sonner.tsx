"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        success: {
          className: "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]",
        },
        error: {
          className: "bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
