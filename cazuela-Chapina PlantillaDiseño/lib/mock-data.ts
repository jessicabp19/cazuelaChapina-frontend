import type { Product, Sale, Combo, InventoryItem, Employee } from "./types"

export const mockProducts: Product[] = [
  // Tamales
  {
    id: "tamal-dulce",
    name: "Tamal Dulce",
    category: "tamal",
    price: 8.0,
    cost: 4.5,
    isSpicy: false,
    ingredients: ["masa", "azúcar", "pasas", "canela"],
    preparationTime: 45,
    image: "/tamal-dulce-guatemalteco.jpg",
  },
  {
    id: "tamal-colorado",
    name: "Tamal Colorado",
    category: "tamal",
    price: 10.0,
    cost: 6.0,
    isSpicy: true,
    ingredients: ["masa", "pollo", "chile guaque", "tomate"],
    preparationTime: 60,
    image: "/tamal-colorado-guatemalteco.jpg",
  },
  {
    id: "tamal-negro",
    name: "Tamal Negro",
    category: "tamal",
    price: 12.0,
    cost: 7.0,
    isSpicy: false,
    ingredients: ["masa", "chocolate", "pollo", "chile pasa"],
    preparationTime: 75,
    image: "/tamal-negro-guatemalteco.jpg",
  },
  // Bebidas
  {
    id: "atol-elote",
    name: "Atol de Elote",
    category: "bebida",
    price: 5.0,
    cost: 2.0,
    isSpicy: false,
    ingredients: ["elote", "leche", "azúcar", "canela"],
    preparationTime: 20,
    image: "/atol-de-elote-guatemalteco.jpg",
  },
  {
    id: "chocolate-caliente",
    name: "Chocolate Caliente",
    category: "bebida",
    price: 6.0,
    cost: 2.5,
    isSpicy: false,
    ingredients: ["cacao", "leche", "azúcar", "canela"],
    preparationTime: 15,
    image: "/chocolate-caliente-guatemalteco.jpg",
  },
  {
    id: "cafe-de-olla",
    name: "Café de Olla",
    category: "bebida",
    price: 4.0,
    cost: 1.5,
    isSpicy: false,
    ingredients: ["café", "panela", "canela"],
    preparationTime: 10,
    image: "/cafe-de-olla-guatemalteco.jpg",
  },
]

export const mockCombos: Combo[] = [
  {
    id: "combo-tradicional",
    name: "Combo Tradicional",
    products: [
      { productId: "tamal-colorado", quantity: 1 },
      { productId: "atol-elote", quantity: 1 },
    ],
    price: 13.0,
    discount: 2.0,
    isActive: true,
  },
  {
    id: "combo-dulce",
    name: "Combo Dulce",
    products: [
      { productId: "tamal-dulce", quantity: 1 },
      { productId: "chocolate-caliente", quantity: 1 },
    ],
    price: 12.0,
    discount: 2.0,
    isActive: true,
  },
]

export const mockInventory: InventoryItem[] = [
  {
    id: "masa-maiz",
    name: "Masa de Maíz",
    category: "masa",
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "kg",
    cost: 8.0,
    supplier: "Molino San José",
  },
  {
    id: "pollo",
    name: "Pollo",
    category: "carne",
    currentStock: 15,
    minStock: 5,
    maxStock: 30,
    unit: "kg",
    cost: 25.0,
    supplier: "Avícola Guatemala",
    expirationDate: new Date("2024-12-20"),
  },
  {
    id: "chile-guaque",
    name: "Chile Guaque",
    category: "condimento",
    currentStock: 3,
    minStock: 1,
    maxStock: 8,
    unit: "kg",
    cost: 15.0,
    supplier: "Especias del Valle",
  },
]

export const mockEmployees: Employee[] = [
  {
    id: "emp-001",
    name: "María González",
    role: "administrador",
    isActive: true,
  },
  {
    id: "emp-002",
    name: "Carlos Morales",
    role: "cajero",
    isActive: true,
  },
  {
    id: "emp-003",
    name: "Ana López",
    role: "cocinero",
    isActive: true,
  },
]

// Generate mock sales data
export const generateMockSales = (): Sale[] => {
  const sales: Sale[] = []
  const now = new Date()

  // Generate sales for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate 5-15 sales per day
    const dailySales = Math.floor(Math.random() * 10) + 5

    for (let j = 0; j < dailySales; j++) {
      const saleTime = new Date(date)
      saleTime.setHours(Math.floor(Math.random() * 12) + 6) // 6 AM to 6 PM
      saleTime.setMinutes(Math.floor(Math.random() * 60))

      const items = []
      const numItems = Math.floor(Math.random() * 3) + 1

      for (let k = 0; k < numItems; k++) {
        const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
        items.push({
          productId: product.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: product.price,
          isCombo: false,
        })
      }

      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      sales.push({
        id: `sale-${i}-${j}`,
        timestamp: saleTime,
        items,
        total,
        paymentMethod: ["efectivo", "tarjeta", "transferencia"][Math.floor(Math.random() * 3)] as any,
        employeeId: mockEmployees[Math.floor(Math.random() * mockEmployees.length)].id,
      })
    }
  }

  return sales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
