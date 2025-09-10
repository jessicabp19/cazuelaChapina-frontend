import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Combos() {
  const [combos, setCombos] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/api/v1/combos?vigentes=true");
      setCombos(data);
    })();
  }, []);
  return (
    <div style={{padding:16}}>
      <h2>Combos vigentes</h2>
      {combos.map(c => (
        <div key={c.id} style={{border:"1px solid #eee",padding:12,marginBottom:8}}>
          <strong>{c.nombre}</strong> — {c.descripcion}
          {c.vigenteDesde && <div style={{fontSize:12,color:"#666"}}>Desde: {c.vigenteDesde}</div>}
          {c.vigenteHasta && <div style={{fontSize:12,color:"#666"}}>Hasta: {c.vigenteHasta}</div>}
        </div>
      ))}
    </div>
  );
}
