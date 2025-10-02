import type { Sale, VarianteDto, DashboardMetrics } from "../types"

export const calculateDashboardMetrics = (sales: Sale[], products: VarianteDto[]): DashboardMetrics => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Daily sales
  const dailySales = sales.filter((sale) => sale.timestamp >= today).reduce((sum, sale) => sum + sale.total, 0)

  // Monthly sales
  const monthlySales = sales.filter((sale) => sale.timestamp >= thisMonth).reduce((sum, sale) => sum + sale.total, 0)

  // Top tamales
  const tamalSales = new Map<string, number>()
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product?.tipoProducto === "tamal") {
        tamalSales.set(item.productId, (tamalSales.get(item.productId) || 0) + item.quantity)
      }
    })
  })

  const topTamales = Array.from(tamalSales.entries())
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Beverages by hour
  const beveragesByHour: { hour: number; beverageId: string; quantity: number }[] = []
  const hourlyBeverages = new Map<string, number>()

  sales.forEach((sale) => {
    const hour = sale.timestamp.getHours()
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product?.tipoProducto === "bebida") {
        const key = `${hour}-${item.productId}`
        hourlyBeverages.set(key, (hourlyBeverages.get(key) || 0) + item.quantity)
      }
    })
  })

  hourlyBeverages.forEach((quantity, key) => {
    const [hour, beverageId] = key.split("-")
    beveragesByHour.push({
      hour: Number.parseInt(hour),
      beverageId,
      quantity,
    })
  })

  // // Spicy vs non-spicy ratio
  // let spicyCount = 0
  // let nonSpicyCount = 0

  // sales.forEach((sale) => {
  //   sale.items.forEach((item) => {
  //     const product = products.find((p) => p.id === item.productId)
  //     if (product?.tipoProducto === "tamal") {
  //       if (product.isSpicy) {
  //         spicyCount += item.quantity
  //       } else {
  //         nonSpicyCount += item.quantity
  //       }
  //     }
  //   })
  // })

  // Profit by line
  const profitByLine = [
    {
      tipoProducto: "Tamales",
      profit: sales.reduce((sum, sale) => {
        return (
          sum +
          sale.items.reduce((itemSum, item) => {
            const product = products.find((p) => p.id === item.productId)
            if (product?.tipoProducto === "tamal") {
              return itemSum + (product.precio - product.costo) * item.quantity
            }
            return itemSum
          }, 0)
        )
      }, 0),
    },
    {
      tipoProducto: "Bebidas",
      profit: sales.reduce((sum, sale) => {
        return (
          sum +
          sale.items.reduce((itemSum, item) => {
            const product = products.find((p) => p.id === item.productId)
            if (product?.tipoProducto === "bebida") {
              return itemSum + (product.precio - product.costo) * item.quantity
            }
            return itemSum
          }, 0)
        )
      }, 0),
    },
  ]

  // Mock waste data (would come from inventory tracking)
  const wasteByIngredient = [
    { ingredientId: "masa-maiz", wasteAmount: 2.5 },
    { ingredientId: "pollo", wasteAmount: 1.2 },
    { ingredientId: "chile-guaque", wasteAmount: 0.3 },
  ]

  return {
    dailySales,
    monthlySales,
    topTamales,
    beveragesByHour,
    // spicyRatio: { spicy: spicyCount, nonSpicy: nonSpicyCount },
    profitByLine,
    wasteByIngredient,
  }
}

export const formatCurrency = (amount: number): string => {
  return `Q${amount.toFixed(2)}`
}

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}
