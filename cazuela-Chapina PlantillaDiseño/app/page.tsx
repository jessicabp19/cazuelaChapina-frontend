"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Package, BarChart3, Utensils, Coffee, Calculator, LogIn } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { getCurrentUser } from "@/lib/auth"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const userData = {
        id: "1",
        name: email.split("@")[0] || "Usuario",
        email: email,
        role: "admin" as const,
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setIsLoading(false)
    }, 1000)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="border-amber-200 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Coffee className="h-12 w-12 text-amber-700" />
                <h1 className="text-3xl font-bold text-amber-900">La Cazuela Chapina</h1>
              </div>
              <CardTitle className="text-xl text-amber-900 flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6" />
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-amber-700">Accede al sistema integral de gestión</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-amber-900">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 text-center">
                  <strong>Demo:</strong> Usa cualquier email y contraseña para acceder
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <UserMenu />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="h-12 w-12 text-amber-700" />
            <h1 className="text-4xl font-bold text-amber-900 text-balance">La Cazuela Chapina</h1>
          </div>
          <p className="text-lg text-amber-700 text-pretty">
            Sistema Integral de Gestión - Sabores Tradicionales de Guatemala
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* POS System */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
                <ShoppingCart className="h-8 w-8 text-amber-700" />
              </div>
              <CardTitle className="text-xl text-amber-900">Sistema POS</CardTitle>
              <CardDescription className="text-amber-700">Punto de venta para procesar órdenes y pagos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pos">
                <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white">Abrir Caja</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Combo Management */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Utensils className="h-8 w-8 text-orange-700" />
              </div>
              <CardTitle className="text-xl text-amber-900">Combos</CardTitle>
              <CardDescription className="text-amber-700">Gestión de combos y ofertas especiales</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/combos">
                <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white">Gestionar Combos</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Package className="h-8 w-8 text-red-700" />
              </div>
              <CardTitle className="text-xl text-amber-900">Inventario</CardTitle>
              <CardDescription className="text-amber-700">Control de materias primas y stock</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/inventory">
                <Button className="w-full bg-red-700 hover:bg-red-800 text-white">Ver Inventario</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200 bg-white/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-blue-700" />
              </div>
              <CardTitle className="text-xl text-amber-900">Dashboard</CardTitle>
              <CardDescription className="text-amber-700">Métricas de ventas y análisis de negocio</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">Ver Métricas</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <Card className="md:col-span-2 lg:col-span-2 border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Resumen del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-900">Q 450.00</p>
                  <p className="text-sm text-amber-700">Ventas Hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-900">32</p>
                  <p className="text-sm text-amber-700">Tamales Vendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-900">18</p>
                  <p className="text-sm text-amber-700">Bebidas Servidas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">85%</p>
                  <p className="text-sm text-amber-700">Ocupación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-amber-700">
          <p className="text-sm">Sistema desarrollado para preservar y potenciar la tradición culinaria guatemalteca</p>
        </div>
      </div>
    </div>
  )
}
