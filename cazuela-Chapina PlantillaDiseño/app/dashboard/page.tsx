"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Flame,
  Coffee,
  BarChart3,
  Pi as Pie,
} from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { UserMenu } from "@/components/user-menu"
import { mockProducts, generateMockSales } from "@/lib/mock-data"
import { calculateDashboardMetrics, formatCurrency, formatPercentage } from "@/lib/utils/analytics"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
} from "recharts"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today")
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "profit" | "quantity">("sales")

  // Generate mock sales data
  const mockSales = useMemo(() => generateMockSales(), [])
  const metrics = useMemo(() => calculateDashboardMetrics(mockSales, mockProducts), [mockSales])

  // Filter sales based on time range
  const filteredSales = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    return mockSales.filter((sale) => sale.timestamp >= startDate)
  }, [mockSales, timeRange])

  // Prepare chart data
  const dailySalesData = useMemo(() => {
    const salesByDay = new Map<string, { sales: number; profit: number; quantity: number }>()

    filteredSales.forEach((sale) => {
      const day = sale.timestamp.toLocaleDateString()
      const current = salesByDay.get(day) || { sales: 0, profit: 0, quantity: 0 }

      const saleProfit = sale.items.reduce((sum, item) => {
        const product = mockProducts.find((p) => p.id === item.productId)
        return sum + (product ? (product.precio - product.costo) * item.quantity : 0)
      }, 0)

      const saleQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0)

      salesByDay.set(day, {
        sales: current.sales + sale.total,
        profit: current.profit + saleProfit,
        quantity: current.quantity + saleQuantity,
      })
    })

    return Array.from(salesByDay.entries())
      .map(([day, data]) => ({
        day: day.split("/").slice(0, 2).join("/"),
        ...data,
      }))
      .slice(-7)
  }, [filteredSales])

  const hourlyBeverageData = useMemo(() => {
    const beveragesByHour = new Map<number, Map<string, number>>()

    filteredSales.forEach((sale) => {
      const hour = sale.timestamp.getHours()
      if (!beveragesByHour.has(hour)) {
        beveragesByHour.set(hour, new Map())
      }

      sale.items.forEach((item) => {
        const product = mockProducts.find((p) => p.id === item.productId)
        if (product?.category === "bebida") {
          const hourMap = beveragesByHour.get(hour)!
          hourMap.set(product.name, (hourMap.get(product.name) || 0) + item.quantity)
        }
      })
    })

    return Array.from(beveragesByHour.entries())
      .map(([hour, beverages]) => {
        const data: any = { hour: `${hour}:00` }
        beverages.forEach((quantity, beverage) => {
          data[beverage] = quantity
        })
        return data
      })
      .sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))
  }, [filteredSales])

  const spicyData = useMemo(() => {
    let spicy = 0
    let nonSpicy = 0

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = mockProducts.find((p) => p.id === item.productId)
        if (product?.category === "tamal") {
          if (product.isSpicy) {
            spicy += item.quantity
          } else {
            nonSpicy += item.quantity
          }
        }
      })
    })

    return [
      { name: "Picante", value: spicy, color: "#dc2626" },
      { name: "No Picante", value: nonSpicy, color: "#16a34a" },
    ]
  }, [filteredSales])

  const topTamales = useMemo(() => {
    const tamalSales = new Map<string, number>()

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = mockProducts.find((p) => p.id === item.productId)
        if (product?.category === "tamal") {
          tamalSales.set(product.name, (tamalSales.get(product.name) || 0) + item.quantity)
        }
      })
    })

    return Array.from(tamalSales.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [filteredSales])

  const wasteData = [
    { ingredient: "Masa de Maíz", waste: 2.5, cost: 20.0 },
    { ingredient: "Pollo", waste: 1.2, cost: 30.0 },
    { ingredient: "Chile Guaque", waste: 0.3, cost: 4.5 },
    { ingredient: "Verduras", waste: 0.8, cost: 12.0 },
  ]

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => {
    return (
      sum +
      sale.items.reduce((itemSum, item) => {
        const product = mockProducts.find((p) => p.id === item.productId)
        return itemSum + (product ? (product.precio - product.costo) * item.quantity : 0)
      }, 0)
    )
  }, 0)

  const colors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="icon" className="border-amber-300 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-amber-900">Dashboard Analítico</h1>
                <p className="text-amber-700">Métricas y análisis de La Cazuela Chapina</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32 border-amber-300 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">7 días</SelectItem>
                  <SelectItem value="month">30 días</SelectItem>
                </SelectContent>
              </Select>
              <UserMenu />
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalSales)}</p>
                    <p className="text-sm text-blue-700">Ventas {timeRange === "today" ? "Hoy" : "Período"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalProfit)}</p>
                    <p className="text-sm text-green-700">Utilidades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Package className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{filteredSales.length}</p>
                    <p className="text-sm text-orange-700">Órdenes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <BarChart3 className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)}
                    </p>
                    <p className="text-sm text-purple-700">Ticket Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="sales" className="data-[state=active]:bg-amber-100">
                Ventas
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-amber-100">
                Productos
              </TabsTrigger>
              <TabsTrigger value="beverages" className="data-[state=active]:bg-amber-100">
                Bebidas
              </TabsTrigger>
              <TabsTrigger value="spicy" className="data-[state=active]:bg-amber-100">
                Picante
              </TabsTrigger>
              <TabsTrigger value="waste" className="data-[state=active]:bg-amber-100">
                Desperdicio
              </TabsTrigger>
            </TabsList>

            {/* Sales Analytics */}
            <TabsContent value="sales">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-900">Ventas Diarias</CardTitle>
                      <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                        <SelectTrigger className="w-32 border-amber-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Ventas</SelectItem>
                          <SelectItem value="profit">Utilidad</SelectItem>
                          <SelectItem value="quantity">Cantidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="day" stroke="#92400e" />
                        <YAxis stroke="#92400e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) =>
                            selectedMetric === "quantity" ? [value, "Unidades"] : [formatCurrency(value), "Monto"]
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke="#f59e0b"
                          fill="#fef3c7"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Utilidades por Línea</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.profitByLine.map((line, index) => {
                        const percentage = (line.profit / totalProfit) * 100
                        return (
                          <div key={line.tipoProducto}>
                            <div className="flex justify-between mb-2">
                              <span className="text-amber-800 font-medium">{line.tipoProducto}</span>
                              <span className="text-amber-900 font-bold">{formatCurrency(line.profit)}</span>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-3 ${index === 0 ? "[&>div]:bg-amber-500" : "[&>div]:bg-orange-500"}`}
                            />
                            <p className="text-sm text-amber-600 mt-1">{percentage.toFixed(1)}% del total</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Analytics */}
            <TabsContent value="products">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      Tamales Más Vendidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topTamales.map((tamal, index) => (
                        <div key={tamal.name} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-amber-200 rounded-full">
                              <span className="text-sm font-bold text-amber-800">#{index + 1}</span>
                            </div>
                            <span className="font-medium text-amber-900">{tamal.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-900">{tamal.quantity}</p>
                            <p className="text-sm text-amber-700">unidades</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Rendimiento por Producto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topTamales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#92400e" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#92400e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Beverages Analytics */}
            <TabsContent value="beverages">
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Bebidas Preferidas por Horario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={hourlyBeverageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="hour" stroke="#92400e" />
                      <YAxis stroke="#92400e" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fef3c7",
                          border: "1px solid #f59e0b",
                          borderRadius: "8px",
                        }}
                      />
                      {mockProducts
                        .filter((p) => p.category === "bebida")
                        .map((product, index) => (
                          <Bar
                            key={product.id}
                            dataKey={product.name}
                            stackId="beverages"
                            fill={colors[index % colors.length]}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spicy Analytics */}
            <TabsContent value="spicy">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      Proporción Picante vs No Picante
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        {/* <Pie
                          data={spicyData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: Impli) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {spicyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie> */}
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Estadísticas Detalladas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {spicyData.map((item) => (
                        <div key={item.name} className="p-4 bg-amber-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-amber-900">{item.name}</span>
                            <Badge style={{ backgroundColor: item.color }} className="text-white">
                              {item.value} unidades
                            </Badge>
                          </div>
                          <Progress
                            value={(item.value / (spicyData[0].value + spicyData[1].value)) * 100}
                            className="h-2"
                            style={{ "--progress-background": item.color } as any}
                          />
                          <p className="text-sm text-amber-700 mt-1">
                            {formatPercentage(item.value, spicyData[0].value + spicyData[1].value)} de preferencia
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Waste Analytics */}
            <TabsContent value="waste">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Desperdicio de Materias Primas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={wasteData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="ingredient" stroke="#92400e" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#92400e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value} kg`, "Desperdicio"]}
                        />
                        <Bar dataKey="waste" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Costo del Desperdicio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {wasteData.map((item, index) => (
                        <div
                          key={item.ingredient}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-red-900">{item.ingredient}</p>
                            <p className="text-sm text-red-700">{item.waste} kg desperdiciados</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-900">{formatCurrency(item.cost)}</p>
                            <p className="text-sm text-red-700">costo perdido</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-red-200">
                        <div className="flex justify-between font-bold text-red-900">
                          <span>Total Desperdicio:</span>
                          <span>{formatCurrency(wasteData.reduce((sum, item) => sum + item.cost, 0))}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
