import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { CrearMovimientoReq, Ingrediente, TipoMovimiento } from "../types";

export default function Inventory() {
  const [tipo, setTipo] = useState<TipoMovimiento>("ENTRADA");
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(100);
  const [costo, setCosto] = useState<number | "">("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get<Ingrediente[]>("/api/v1/ingredientes");
      setIngredientes(data);
      if (data.length > 0) setSelId(data[0].id);
    })();
  }, []);

  const sel = ingredientes.find(i => i.id === selId);

  const submit = async () => {
    if (!selId) return alert("Selecciona un ingrediente");
    const req: CrearMovimientoReq = {
      tipo,
      sucursalId: 1,
      items: [{
        ingredienteId: selId,
        cantidad,
        ...(tipo === "ENTRADA" && costo !== "" ? { costoUnitario: Number(costo) } : {})
      }]
    };
    try {
      await api.post("/api/v1/inventario/movimientos", req);
      alert("Movimiento registrado");
      // refresca stock
      const { data } = await api.get<Ingrediente[]>("/api/v1/ingredientes");
      setIngredientes(data);
      setCosto("");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error");
      console.error(e?.response?.data || e);
    }
  };

  return (
    <div style={{padding:16}}>
      <h2>Inventario</h2>
      <div style={{display:"grid",gap:8,maxWidth:420}}>
        <label>Tipo
          <select value={tipo} onChange={e => setTipo(e.target.value as TipoMovimiento)}>
            <option>ENTRADA</option>
            <option>MERMA</option>
            <option>COCCION</option>
            <option>SALIDA</option>
          </select>
        </label>

        <label>Ingrediente
          <select value={selId ?? ""} onChange={e => setSelId(Number(e.target.value))}>
            {ingredientes.map(i =>
              <option key={i.id} value={i.id}>
                {i.nombre} ({i.unidad})
              </option>
            )}
          </select>
        </label>

        {sel && (
          <div style={{fontSize:12,color:"#555"}}>
            Stock actual: <b>{sel.cantidadActual}</b> {sel.unidad} · Punto crítico: <b>{sel.puntoCritico}</b>
          </div>
        )}

        <label>Cantidad
          <input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))}/>
        </label>

        {tipo === "ENTRADA" && (
          <label>Costo unitario (GTQ) — opcional
            <input type="number" step="0.0001"
                   value={costo} onChange={e => setCosto(e.target.value === "" ? "" : Number(e.target.value))}/>
          </label>
        )}

        <button onClick={submit}>Guardar</button>
      </div>
    </div>
  );
}
