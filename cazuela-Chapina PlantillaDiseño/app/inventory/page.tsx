"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Edit, Trash2, Package, AlertTriangle, TrendingDown, Calendar, Search } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { UserMenu } from "@/components/user-menu"
import { mockInventory } from "@/lib/mock-data"
import type { InventoryItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/analytics"

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    category: "masa" as InventoryItem["category"],
    currentStock: "",
    minStock: "",
    maxStock: "",
    unit: "kg" as InventoryItem["unit"],
    cost: "",
    supplier: "",
    expirationDate: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      category: "masa",
      currentStock: "",
      minStock: "",
      maxStock: "",
      unit: "kg",
      cost: "",
      supplier: "",
      expirationDate: "",
    })
    setEditingItem(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      cost: item.cost.toString(),
      supplier: item.supplier,
      expirationDate: item.expirationDate ? item.expirationDate.toISOString().split("T")[0] : "",
    })
    setEditingItem(item)
    setIsCreateDialogOpen(true)
  }

  const saveItem = () => {
    if (!formData.name || !formData.currentStock || !formData.minStock || !formData.maxStock || !formData.cost) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const itemData: InventoryItem = {
      id: editingItem?.id || `inv-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      currentStock: Number.parseFloat(formData.currentStock),
      minStock: Number.parseFloat(formData.minStock),
      maxStock: Number.parseFloat(formData.maxStock),
      unit: formData.unit,
      cost: Number.parseFloat(formData.cost),
      supplier: formData.supplier,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
    }

    if (editingItem) {
      setInventory(inventory.map((item) => (item.id === editingItem.id ? itemData : item)))
    } else {
      setInventory([...inventory, itemData])
    }

    setIsCreateDialogOpen(false)
    resetForm()
  }

  const deleteItem = (itemId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      setInventory(inventory.filter((item) => item.id !== itemId))
    }
  }

  const updateStock = (itemId: string, newStock: number) => {
    setInventory(inventory.map((item) => (item.id === itemId ? { ...item, currentStock: newStock } : item)))
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return "critical"
    if (item.currentStock <= item.minStock * 1.5) return "low"
    return "normal"
  }

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min((item.currentStock / item.maxStock) * 100, 100)
  }

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expirationDate) return false
    const today = new Date()
    const daysUntilExpiration = Math.ceil((item.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0
  }

  const isExpired = (item: InventoryItem) => {
    if (!item.expirationDate) return false
    return item.expirationDate < new Date()
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter((item) => getStockStatus(item) === "critical")
  const expiringItems = inventory.filter((item) => isExpiringSoon(item) || isExpired(item))
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.cost, 0)

  const categories = ["all", "masa", "carne", "verdura", "bebida", "condimento"]

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
                <h1 className="text-3xl font-bold text-amber-900">Control de Inventario</h1>
                <p className="text-amber-700">Gestión de materias primas y stock</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={openCreateDialog} className="bg-red-700 hover:bg-red-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Artículo
              </Button>
              <UserMenu />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{inventory.length}</p>
                    <p className="text-sm text-blue-700">Total Artículos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-900">{lowStockItems.length}</p>
                    <p className="text-sm text-red-700">Stock Bajo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{expiringItems.length}</p>
                    <p className="text-sm text-orange-700">Por Vencer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingDown className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalValue)}</p>
                    <p className="text-sm text-green-700">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-100">
                Inventario
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-100">
                Alertas
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-amber-100">
                Reportes
              </TabsTrigger>
            </TabsList>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <CardTitle className="text-amber-900">Artículos en Inventario</CardTitle>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                        <Input
                          placeholder="Buscar artículos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-amber-300"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40 border-amber-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="masa">Masa</SelectItem>
                          <SelectItem value="carne">Carne</SelectItem>
                          <SelectItem value="verdura">Verdura</SelectItem>
                          <SelectItem value="bebida">Bebida</SelectItem>
                          <SelectItem value="condimento">Condimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600 mb-4">No se encontraron artículos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item)
                        const stockPercentage = getStockPercentage(item)

                        return (
                          <Card
                            key={item.id}
                            className={`${
                              stockStatus === "critical"
                                ? "border-red-300 bg-red-50"
                                : stockStatus === "low"
                                  ? "border-orange-300 bg-orange-50"
                                  : "border-gray-200 bg-white"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-amber-900">{item.name}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {item.category}
                                    </Badge>
                                    {isExpired(item) && (
                                      <Badge variant="destructive" className="text-xs">
                                        Vencido
                                      </Badge>
                                    )}
                                    {isExpiringSoon(item) && !isExpired(item) && (
                                      <Badge className="bg-orange-500 text-white text-xs">Por Vencer</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-amber-700">Proveedor: {item.supplier}</p>
                                  {item.expirationDate && (
                                    <p className="text-sm text-amber-600">
                                      Vence: {item.expirationDate.toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(item)}
                                    className="h-8 w-8 p-0 border-amber-300"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteItem(item.id)}
                                    className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Stock Info */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-amber-700">Stock Actual</span>
                                    <span className="font-medium text-amber-900">
                                      {item.currentStock} {item.unit}
                                    </span>
                                  </div>
                                  <Progress
                                    value={stockPercentage}
                                    className={`h-2 ${
                                      stockStatus === "critical"
                                        ? "[&>div]:bg-red-500"
                                        : stockStatus === "low"
                                          ? "[&>div]:bg-orange-500"
                                          : "[&>div]:bg-green-500"
                                    }`}
                                  />
                                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                                    <span>Min: {item.minStock}</span>
                                    <span>Max: {item.maxStock}</span>
                                  </div>
                                </div>

                                {/* Cost Info */}
                                <div>
                                  <p className="text-sm text-amber-700 mb-1">Costo Unitario</p>
                                  <p className="font-medium text-amber-900">{formatCurrency(item.cost)}</p>
                                  <p className="text-xs text-amber-600">
                                    Total: {formatCurrency(item.currentStock * item.cost)}
                                  </p>
                                </div>

                                {/* Quick Actions */}
                                <div>
                                  <p className="text-sm text-amber-700 mb-2">Ajustar Stock</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStock(item.id, Math.max(0, item.currentStock - 1))}
                                      className="flex-1 border-amber-300"
                                    >
                                      -1
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStock(item.id, item.currentStock + 1)}
                                      className="flex-1 border-amber-300"
                                    >
                                      +1
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-900 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Stock Bajo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockItems.length === 0 ? (
                      <p className="text-red-700 text-center py-4">No hay artículos con stock bajo</p>
                    ) : (
                      <div className="space-y-3">
                        {lowStockItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                            <div>
                              <p className="font-medium text-red-900">{item.name}</p>
                              <p className="text-sm text-red-700">
                                {item.currentStock} {item.unit} (Min: {item.minStock})
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openEditDialog(item)}
                              className="bg-red-700 hover:bg-red-800 text-white"
                            >
                              Reabastecer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expiration Alerts */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Próximos a Vencer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expiringItems.length === 0 ? (
                      <p className="text-orange-700 text-center py-4">No hay artículos próximos a vencer</p>
                    ) : (
                      <div className="space-y-3">
                        {expiringItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                            <div>
                              <p className="font-medium text-orange-900">{item.name}</p>
                              <p className="text-sm text-orange-700">
                                {item.expirationDate?.toLocaleDateString()} -{" "}
                                {isExpired(item) ? "Vencido" : "Por vencer"}
                              </p>
                            </div>
                            <Badge variant={isExpired(item) ? "destructive" : "default"} className="text-xs">
                              {isExpired(item) ? "Vencido" : "Urgente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900">Reportes de Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock by Category */}
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-3">Stock por Categoría</h3>
                      <div className="space-y-2">
                        {categories.slice(1).map((category) => {
                          const categoryItems = inventory.filter((item) => item.category === category)
                          const categoryValue = categoryItems.reduce(
                            (sum, item) => sum + item.currentStock * item.cost,
                            0,
                          )
                          return (
                            <div key={category} className="flex justify-between p-2 bg-amber-50 rounded">
                              <span className="capitalize text-amber-800">{category}</span>
                              <div className="text-right">
                                <p className="font-medium text-amber-900">{categoryItems.length} artículos</p>
                                <p className="text-sm text-amber-700">{formatCurrency(categoryValue)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Top Suppliers */}
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-3">Principales Proveedores</h3>
                      <div className="space-y-2">
                        {Array.from(new Set(inventory.map((item) => item.supplier))).map((supplier) => {
                          const supplierItems = inventory.filter((item) => item.supplier === supplier)
                          const supplierValue = supplierItems.reduce(
                            (sum, item) => sum + item.currentStock * item.cost,
                            0,
                          )
                          return (
                            <div key={supplier} className="flex justify-between p-2 bg-amber-50 rounded">
                              <span className="text-amber-800">{supplier}</span>
                              <div className="text-right">
                                <p className="font-medium text-amber-900">{supplierItems.length} artículos</p>
                                <p className="text-sm text-amber-700">{formatCurrency(supplierValue)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create/Edit Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-amber-900">
                  {editingItem ? "Editar Artículo" : "Agregar Nuevo Artículo"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-amber-900">
                      Nombre del Artículo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Masa de Maíz"
                      className="border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-amber-900">
                      Categoría *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="border-amber-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masa">Masa</SelectItem>
                        <SelectItem value="carne">Carne</SelectItem>
                        <SelectItem value="verdura">Verdura</SelectItem>
                        <SelectItem value="bebida">Bebida</SelectItem>
                        <SelectItem value="condimento">Condimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock" className="text-amber-900">
                      Stock Actual *
                    </Label>
                    <Input
                      id="currentStock"
                      type="number"
                      step="0.1"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      placeholder="0"
                      className="border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock" className="text-amber-900">
                      Stock Mínimo *
                    </Label>
                    <Input
                      id="minStock"
                      type="number"
                      step="0.1"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="0"
                      className="border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStock" className="text-amber-900">
                      Stock Máximo *
                    </Label>
                    <Input
                      id="maxStock"
                      type="number"
                      step="0.1"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                      placeholder="0"
                      className="border-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit" className="text-amber-900">
                      Unidad de Medida *
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger className="border-amber-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramos</SelectItem>
                        <SelectItem value="litros">Litros</SelectItem>
                        <SelectItem value="unidades">Unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cost" className="text-amber-900">
                      Costo Unitario *
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
                      className="border-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier" className="text-amber-900">
                      Proveedor
                    </Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nombre del proveedor"
                      className="border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate" className="text-amber-900">
                      Fecha de Vencimiento
                    </Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="border-amber-300"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-amber-300"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={saveItem} className="flex-1 bg-red-700 hover:bg-red-800 text-white">
                    {editingItem ? "Actualizar" : "Agregar"} Artículo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthGuard>
  )
}
