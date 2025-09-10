export type Presentacion = "U" | "_6" | "_12" | "_12oz" | "_1L";

export interface VarianteDto {
  id: number;
  producto: string;
  tipoProducto: "TAMAL" | "BEBIDA";
  presentacion: Presentacion;
  precio: number;
  atributos: Record<string, string>;
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
