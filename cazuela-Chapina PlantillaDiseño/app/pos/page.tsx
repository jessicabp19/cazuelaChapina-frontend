'use client';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"
import { mockProducts, mockCombos } from "@/lib/mock-data"
import type { VarianteDto, Combo, SaleItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/analytics"
import { AuthGuard } from "@/components/auth-guard"
import { UserMenu } from "@/components/user-menu"
import { api } from "../../lib/api";

export default function POSPage() {
  const [cart, setCart] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "transferencia">("efectivo")
  const [cashReceived, setCashReceived] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "tamal" | "bebida">("all")
  const [variantes, setVariantes] = useState<VarianteDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<VarianteDto[]>("/api/v1/variantes");
        setVariantes(data);
      } finally { setLoading(false); }
    })();
  }, []);
  
  const filteredProducts =
    selectedCategory === "all" ? variantes : variantes.filter((p) => p.tipoProducto === selectedCategory.toUpperCase())

  const addToCart = (product: VarianteDto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && !item.isCombo)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && !item.isCombo ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
          unitPrice: product.precio,
          isCombo: false,
        },
      ]
    })
  }

  const addComboToCart = (combo: Combo) => {
    setCart((prev) => [
      ...prev,
      {
        productId: combo.id,
        quantity: 1,
        unitPrice: combo.price,
        isCombo: true,
        comboId: combo.id,
      },
    ])
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== index))
    } else {
      setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const getProductName = (item: SaleItem) => {
    if (item.isCombo) {
      return mockCombos.find((c) => c.id === item.comboId)?.name || "Combo"
    }
    return variantes.find((p) => p.id === item.productId)?.producto  + "( " + variantes.find((p) => p.id === item.productId)?.presentacion  + " )" || "Producto"
  }

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * 0.12 // IVA 12%
  const total = subtotal + tax

  const change = paymentMethod === "efectivo" && cashReceived ? Math.max(0, Number.parseFloat(cashReceived) - total) : 0

  const canProcessSale =
    cart.length > 0 && (paymentMethod !== "efectivo" || (cashReceived && Number.parseFloat(cashReceived) >= total))

  const processSale = () => {
    if (!canProcessSale) return

    // Here would be the actual sale processing logic
    alert(`Venta procesada por ${formatCurrency(total)}`)
    setCart([])
    setCashReceived("")
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
                <h1 className="text-3xl font-bold text-amber-900">Sistema POS</h1>
                <p className="text-amber-700">La Cazuela Chapina - Punto de Venta</p>
              </div>
            </div>
            <UserMenu />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Filter */}
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      onClick={() => setSelectedCategory("all")}
                      className={selectedCategory === "all" ? "bg-amber-700 hover:bg-amber-800" : "border-amber-300"}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedCategory === "tamal" ? "default" : "outline"}
                      onClick={() => setSelectedCategory("tamal")}
                      className={selectedCategory === "tamal" ? "bg-amber-700 hover:bg-amber-800" : "border-amber-300"}
                    >
                      Tamales
                    </Button>
                    <Button
                      variant={selectedCategory === "bebida" ? "default" : "outline"}
                      onClick={() => setSelectedCategory("bebida")}
                      className={selectedCategory === "bebida" ? "bg-amber-700 hover:bg-amber-800" : "border-amber-300"}
                    >
                      Bebidas
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900">Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-amber-100"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                            <img
                              src={
                                product.producto?.toLowerCase().includes("tamal")
                                  ? "tamal-colorado-guatemalteco.jpg"
                                  : "atol-de-elote-guatemalteco.jpg"
                              }
                              alt={product.producto}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </div>
                          <h3 className="font-semibold text-amber-900 text-sm mb-1">{product.producto + "( " + product.presentacion  + " )"}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-amber-800">{formatCurrency(product.precio)}</span>
                            {/* {product.isSpicy && (
                              <Badge variant="destructive" className="text-xs">
                                Picante
                              </Badge>
                            )} */}
                          </div>
                          {/* <p className="text-xs text-amber-600 mt-1">{product.atributos.} min</p> */
                          Object.entries(product.atributos).map(([k,val]) => <span className="text-xs text-amber-600 mt-1" key={k} style={{marginRight:8}}>{k}:{val}</span>)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Combos Section */}
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900">Combos Especiales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockCombos
                      .filter((combo) => combo.isActive)
                      .map((combo) => (
                        <Card
                          key={combo.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50"
                          onClick={() => addComboToCart(combo)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-green-900 mb-2">{combo.name}</h3>
                            <div className="text-sm text-green-700 mb-2">
                              {combo.products
                                .map((cp) => {
                                  const product = mockProducts.find((p) => p.id === cp.productId)
                                  return product ? `${cp.quantity}x ${product.name}` : ""
                                })
                                .join(" + ")}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-green-800">{formatCurrency(combo.price)}</span>
                                <span className="text-sm text-green-600 ml-2">
                                  (Ahorro: {formatCurrency(combo.discount)})
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart and Payment Section */}
            <div className="space-y-6">
              {/* Cart */}
              <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Orden Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-amber-600 text-center py-8">No hay productos en la orden</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-amber-900 text-sm">
                              {getProductName(item)}
                              {item.isCombo && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Combo
                                </Badge>
                              )}
                            </p>
                            <p className="text-amber-700 text-xs">{formatCurrency(item.unitPrice)} c/u</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="h-6 w-6 p-0 border-amber-300"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="h-6 w-6 p-0 border-amber-300"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment */}
              {cart.length > 0 && (
                <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Pago</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700">Subtotal:</span>
                        <span className="text-amber-900">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700">IVA (12%):</span>
                        <span className="text-amber-900">{formatCurrency(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-900">Total:</span>
                        <span className="text-amber-900 text-lg">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="text-sm font-medium text-amber-900 mb-2 block">Método de Pago</label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger className="border-amber-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Efectivo
                            </div>
                          </SelectItem>
                          <SelectItem value="tarjeta">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Tarjeta
                            </div>
                          </SelectItem>
                          <SelectItem value="transferencia">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              Transferencia
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cash Input */}
                    {paymentMethod === "efectivo" && (
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">Efectivo Recibido</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="border-amber-300"
                        />
                        {cashReceived && Number.parseFloat(cashReceived) >= total && (
                          <p className="text-sm text-green-700 mt-1">Cambio: {formatCurrency(change)}</p>
                        )}
                      </div>
                    )}

                    {/* Process Sale Button */}
                    <Button
                      onClick={processSale}
                      disabled={!canProcessSale}
                      className="w-full bg-green-700 hover:bg-green-800 text-white"
                    >
                      Procesar Venta - {formatCurrency(total)}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
