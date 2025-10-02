"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    if (!currentUser) {
      window.location.href = "/login"
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-amber-700">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
