"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import { getCurrentUser, logout } from "@/lib/auth"
import type { User as UserType } from "@/lib/auth"

export function UserMenu() {
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex items-center rounded-md bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
      >
        Iniciar Sesión
      </a>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-amber-300 bg-white/80 px-4 py-2"
        >
          <User className="h-4 w-4 mr-2" />
          {user.name}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-amber-900">{user.name}</p>
          <p className="text-xs text-amber-700">{user.email}</p>
          <p className="text-xs text-amber-600 capitalize">{user.role}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-amber-700">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
