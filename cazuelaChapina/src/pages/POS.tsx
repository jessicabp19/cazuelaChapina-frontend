import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { CrearOrdenReq, VarianteDto } from "../types";
import { useCart } from "../store/cart";

export default function POS() {
  const [variantes, setVariantes] = useState<VarianteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const cart = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<VarianteDto[]>("/api/v1/variantes");
        setVariantes(data);
      } finally { setLoading(false); }
    })();
  }, []);

  const tamales = useMemo(() => variantes.filter(v => v.tipoProducto === "TAMAL"), [variantes]);
  const bebidas = useMemo(() => variantes.filter(v => v.tipoProducto === "BEBIDA"), [variantes]);

  const placeOrder = async () => {
    if (cart.items.length === 0) return alert("Carrito vacío");
    const req: CrearOrdenReq = {
      sucursalId: 1,
      items: cart.items.map(i => ({ varianteId: i.varianteId, cantidad: i.cantidad }))
    };
    try {
      const { data } = await api.post("/api/v1/ordenes", req);
      alert(`Orden creada (ID: ${data.ordenId}) Total: Q${data.total}`);
      cart.clear();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error creando orden");
      console.error(e?.response?.data || e);
    }
  };

  return (
    <div style={{padding:16}}>
      <h2>POS</h2>
      {loading && <p>Cargando menú…</p>}

      <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <h3>Tamales</h3>
          {tamales.map(v => (
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #eee"}}>
              <div>
                <strong>{v.producto}</strong> — {v.presentacion} — Q{v.precio.toFixed(2)}
                <div style={{fontSize:12,color:"#666"}}>
                  {Object.entries(v.atributos).map(([k,val]) => <span key={k} style={{marginRight:8}}>{k}:{val}</span>)}
                </div>
              </div>
              <button onClick={() => cart.add({ varianteId: v.id, nombre: v.producto, presentacion: v.presentacion, precioUnit: v.precio })}>
                Agregar
              </button>
            </div>
          ))}
          <h3 style={{marginTop:16}}>Bebidas</h3>
          {bebidas.map(v => (
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #eee"}}>
              <div>
                <strong>{v.producto}</strong> — {v.presentacion} — Q{v.precio.toFixed(2)}
                <div style={{fontSize:12,color:"#666"}}>
                  {Object.entries(v.atributos).map(([k,val]) => <span key={k} style={{marginRight:8}}>{k}:{val}</span>)}
                </div>
              </div>
              <button onClick={() => cart.add({ varianteId: v.id, nombre: v.producto, presentacion: v.presentacion, precioUnit: v.precio })}>
                Agregar
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3>Carrito</h3>
          {cart.items.length === 0 && <p>Sin items</p>}
          {cart.items.map(i => (
            <div key={i.varianteId} style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
              <span>{i.nombre} {i.presentacion} × {i.cantidad}</span>
              <div>
                Q{(i.precioUnit * i.cantidad).toFixed(2)}
                <button style={{marginLeft:8}} onClick={() => useCart.getState().remove(i.varianteId)}>x</button>
              </div>
            </div>
          ))}
          <div style={{marginTop:8,fontWeight:"bold"}}>Total: Q{cart.total().toFixed(2)}</div>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button onClick={placeOrder} disabled={cart.items.length===0}>Confirmar orden</button>
            <button onClick={() => cart.clear()} disabled={cart.items.length===0}>Vaciar</button>
          </div>
        </div>
      </section>
    </div>
  );
}
