import { useState } from "react";
import { api } from "../lib/api";
import type { CrearMovimientoReq, TipoMovimiento } from "../types";

export default function Inventory() {
  const [tipo, setTipo] = useState<TipoMovimiento>("ENTRADA");
  const [ingredienteId, setIngredienteId] = useState<number>(1);
  const [cantidad, setCantidad] = useState<number>(100);
  const [costo, setCosto] = useState<number | "">("");

  const submit = async () => {
    const req: CrearMovimientoReq = {
      tipo,
      sucursalId: 1,
      items: [{ ingredienteId, cantidad, ...(costo !== "" ? { costoUnitario: Number(costo) } : {}) }]
    };
    try {
      await api.post("/api/v1/inventario/movimientos", req);
      alert("Movimiento registrado");
    } catch (e:any) {
      alert(e?.response?.data?.message || "Error");
      console.error(e?.response?.data || e);
    }
  };

  return (
    <div style={{padding:16}}>
      <h2>Inventario</h2>
      <div style={{display:"grid",gap:8,maxWidth:360}}>
        <label>Tipo
          <select value={tipo} onChange={e => setTipo(e.target.value as TipoMovimiento)}>
            <option>ENTRADA</option>
            <option>MERMA</option>
            <option>COCCION</option>
            <option>SALIDA</option>
          </select>
        </label>
        <label>IngredienteId
          <input type="number" value={ingredienteId} onChange={e => setIngredienteId(Number(e.target.value))}/>
        </label>
        <label>Cantidad
          <input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))}/>
        </label>
        <label>Costo unitario (solo ENTRADA)
          <input type="number" value={costo} onChange={e => setCosto(e.target.value === "" ? "" : Number(e.target.value))}/>
        </label>
        <button onClick={submit}>Guardar</button>
      </div>
      <p style={{marginTop:8,fontSize:12,color:"#666"}}>Tip: pronto añadimos <i>GET /ingredientes</i> para no escribir IDs a ciegas.</p>
    </div>
  );
}
