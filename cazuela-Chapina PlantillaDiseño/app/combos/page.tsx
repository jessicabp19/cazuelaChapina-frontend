"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Trash2, Package, Utensils } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { UserMenu } from "@/components/user-menu"
import { mockProducts, mockCombos } from "@/lib/mock-data"
import type { Combo, ComboProduct } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/analytics"

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>(mockCombos)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount: "",
    isActive: true,
    products: [] as ComboProduct[],
  })

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      discount: "",
      isActive: true,
      products: [],
    })
    setEditingCombo(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (combo: Combo) => {
    setFormData({
      name: combo.name,
      price: combo.price.toString(),
      discount: combo.discount.toString(),
      isActive: combo.isActive,
      products: [...combo.products],
    })
    setEditingCombo(combo)
    setIsCreateDialogOpen(true)
  }

  const addProductToCombo = (productId: string) => {
    const existing = formData.products.find((p) => p.productId === productId)
    if (existing) {
      setFormData({
        ...formData,
        products: formData.products.map((p) => (p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)),
      })
    } else {
      setFormData({
        ...formData,
        products: [...formData.products, { productId, quantity: 1 }],
      })
    }
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setFormData({
        ...formData,
        products: formData.products.filter((p) => p.productId !== productId),
      })
    } else {
      setFormData({
        ...formData,
        products: formData.products.map((p) => (p.productId === productId ? { ...p, quantity } : p)),
      })
    }
  }

  const calculateOriginalPrice = () => {
    return formData.products.reduce((sum, cp) => {
      const product = mockProducts.find((p) => p.id === cp.productId)
      return sum + (product ? product.price * cp.quantity : 0)
    }, 0)
  }

  const saveCombo = () => {
    if (!formData.name || !formData.price || formData.products.length === 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const comboData: Combo = {
      id: editingCombo?.id || `combo-${Date.now()}`,
      name: formData.name,
      price: Number.parseFloat(formData.price),
      discount: Number.parseFloat(formData.discount) || 0,
      isActive: formData.isActive,
      products: formData.products,
    }

    if (editingCombo) {
      setCombos(combos.map((c) => (c.id === editingCombo.id ? comboData : c)))
    } else {
      setCombos([...combos, comboData])
    }

    setIsCreateDialogOpen(false)
    resetForm()
  }

  const deleteCombo = (comboId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este combo?")) {
      setCombos(combos.filter((c) => c.id !== comboId))
    }
  }

  const toggleComboStatus = (comboId: string) => {
    setCombos(combos.map((c) => (c.id === comboId ? { ...c, isActive: !c.isActive } : c)))
  }

  const getProductName = (productId: string) => {
    return mockProducts.find((p) => p.id === productId)?.name || "Producto"
  }

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
                <h1 className="text-3xl font-bold text-amber-900">Gestión de Combos</h1>
                <p className="text-amber-700">Crear y administrar combos especiales</p>
              </div>
            </div>
            <UserMenu />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{combos.filter((c) => c.isActive).length}</p>
                    <p className="text-sm text-green-700">Combos Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Utensils className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{combos.length}</p>
                    <p className="text-sm text-blue-700">Total Combos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Package className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(combos.filter((c) => c.isActive).reduce((sum, c) => sum + c.discount, 0))}
                    </p>
                    <p className="text-sm text-purple-700">Ahorro Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combos List */}
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Combos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {combos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-600 mb-4">No hay combos creados</p>
                  <Button onClick={openCreateDialog} className="bg-orange-700 hover:bg-orange-800 text-white">
                    Crear Primer Combo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {combos.map((combo) => {
                    const originalPrice = combo.products.reduce((sum, cp) => {
                      const product = mockProducts.find((p) => p.id === cp.productId)
                      return sum + (product ? product.price * cp.quantity : 0)
                    }, 0)

                    return (
                      <Card
                        key={combo.id}
                        className={`${
                          combo.isActive ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-75"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg text-amber-900">{combo.name}</CardTitle>
                              <Badge variant={combo.isActive ? "default" : "secondary"} className="mt-1">
                                {combo.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(combo)}
                                className="h-8 w-8 p-0 border-amber-300"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCombo(combo.id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Products in combo */}
                          <div>
                            <p className="text-sm font-medium text-amber-900 mb-2">Incluye:</p>
                            <div className="space-y-1">
                              {combo.products.map((cp, index) => (
                                <div key={index} className="text-sm text-amber-700">
                                  • {cp.quantity}x {getProductName(cp.productId)}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-700">Precio individual:</span>
                              <span className="line-through text-amber-600">{formatCurrency(originalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-700">Descuento:</span>
                              <span className="text-green-700">-{formatCurrency(combo.discount)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-amber-900">Precio combo:</span>
                              <span className="text-green-800 text-lg">{formatCurrency(combo.price)}</span>
                            </div>
                          </div>

                          {/* Toggle Status */}
                          <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                            <span className="text-sm text-amber-700">Estado:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-amber-700">{combo.isActive ? "Activo" : "Inactivo"}</span>
                              <Switch checked={combo.isActive} onCheckedChange={() => toggleComboStatus(combo.id)} />
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

          {/* Create/Edit Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-amber-900">
                  {editingCombo ? "Editar Combo" : "Crear Nuevo Combo"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-amber-900">
                      Nombre del Combo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Combo Tradicional"
                      className="border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-amber-900">
                      Precio Final *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="border-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount" className="text-amber-900">
                      Descuento
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0.00"
                      className="border-amber-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="text-amber-900">
                      Combo Activo
                    </Label>
                  </div>
                </div>

                {/* Products Selection */}
                <div>
                  <Label className="text-amber-900 mb-3 block">Productos del Combo *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {mockProducts.map((product) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        onClick={() => addProductToCombo(product.id)}
                        className="justify-start h-auto p-3 border-amber-300"
                      >
                        <div className="text-left">
                          <p className="font-medium text-amber-900">{product.name}</p>
                          <p className="text-sm text-amber-700">{formatCurrency(product.price)}</p>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Selected Products */}
                  {formData.products.length > 0 && (
                    <div className="space-y-2 p-3 bg-amber-50 rounded-lg">
                      <p className="font-medium text-amber-900">Productos seleccionados:</p>
                      {formData.products.map((cp, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-amber-800">
                            {cp.quantity}x {getProductName(cp.productId)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProductQuantity(cp.productId, cp.quantity - 1)}
                              className="h-6 w-6 p-0 border-amber-300"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">{cp.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProductQuantity(cp.productId, cp.quantity + 1)}
                              className="h-6 w-6 p-0 border-amber-300"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-amber-200">
                        <p className="text-sm text-amber-700">
                          Precio individual total: {formatCurrency(calculateOriginalPrice())}
                        </p>
                        {formData.price && (
                          <p className="text-sm text-green-700">
                            Ahorro: {formatCurrency(calculateOriginalPrice() - Number.parseFloat(formData.price))}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-amber-300"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={saveCombo} className="flex-1 bg-orange-700 hover:bg-orange-800 text-white">
                    {editingCombo ? "Actualizar" : "Crear"} Combo
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
