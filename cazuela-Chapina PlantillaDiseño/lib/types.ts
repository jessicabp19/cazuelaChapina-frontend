 export interface Product {
  id: string
  name: string
  category: "tamal" | "bebida"
  price: number
  cost: number
  isSpicy: boolean
  ingredients: string[]
  preparationTime: number // minutes
  image?: string
 }

export interface Sale {
  id: string
  timestamp: Date
  items: SaleItem[]
  total: number
  paymentMethod: "efectivo" | "tarjeta" | "transferencia"
  employeeId: string
}

export interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
  isCombo: boolean
  comboId?: string
}

export interface Combo {
  id: string
  name: string
  products: ComboProduct[]
  price: number
  discount: number
  isActive: boolean
}

export interface ComboProduct {
  productId: string
  quantity: number
}

export interface InventoryItem {
  id: string
  name: string
  category: "masa" | "carne" | "verdura" | "bebida" | "condimento"
  currentStock: number
  minStock: number
  maxStock: number
  unit: "kg" | "litros" | "unidades"
  cost: number
  supplier: string
  expirationDate?: Date
}

export interface Employee {
  id: string
  name: string
  role: "cajero" | "cocinero" | "administrador"
  isActive: boolean
}

export interface DashboardMetrics {
  dailySales: number
  monthlySales: number
  topTamales: { productId: string; quantity: number }[]
  beveragesByHour: { hour: number; beverageId: string; quantity: number }[]
  // spicyRatio: { spicy: number; nonSpicy: number }
  profitByLine: { tipoProducto: string; profit: number }[]
  wasteByIngredient: { ingredientId: string; wasteAmount: number }[]
}



export type Presentacion = "U" | "_6" | "_12" | "_12oz" | "_1L";

export interface VarianteDto {
  id: string;
  producto: string;
  tipoProducto: "tamal" | "bebida";
  presentacion: Presentacion;
  precio: number;
  costo: number;
  atributos: Record<string, string>;
  imagen: string;
}

export interface OrdenItemReq { varianteId: number; cantidad: number; }
export interface CrearOrdenReq { sucursalId?: number; items: OrdenItemReq[]; }

export type TipoMovimiento = "ENTRADA" | "MERMA" | "COCCION" | "SALIDA";

export interface CrearMovimientoReq {
  tipo: TipoMovimiento;
  sucursalId?: number;
  items: { ingredienteId: number; cantidad: number; costoUnitario?: number }[];
}

export interface DashboardRes {
  ventasDia: number;
  ventasMes: number;
  topTamales: { tamal: string; unidades: number }[];
  proporcionPicante: { con: number; sin: number };
}

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad: string;
  costoPromedio: number;
  cantidadActual: number;
  puntoCritico: number;
}

