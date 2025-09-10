import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DashboardRes } from "../types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardRes | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get<DashboardRes>("/api/v1/dashboard/metricas");
      setData(data);
    })();
  }, []);

  if (!data) return <div style={{padding:16}}>Cargando…</div>;

  return (
    <div style={{padding:16}}>
      <h2>Dashboard</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,maxWidth:720}}>
        <Card title="Ventas hoy">Q{data.ventasDia.toFixed(2)}</Card>
        <Card title="Ventas mes">Q{data.ventasMes.toFixed(2)}</Card>
        <Card title="Top Tamales">
          <ul style={{margin:0,paddingLeft:16}}>
            {data.topTamales.map(t => <li key={t.tamal}>{t.tamal}: {t.unidades}</li>)}
          </ul>
        </Card>
        <Card title="Picante vs No">
          Con: {(data.proporcionPicante.con*100).toFixed(1)}% ·
          Sin: {(data.proporcionPicante.sin*100).toFixed(1)}%
        </Card>
      </div>
    </div>
  );
}

function Card({title, children}:{title:string, children:any}) {
  return <div style={{border:"1px solid #eee",borderRadius:8,padding:12}}>
    <div style={{fontWeight:"bold",marginBottom:8}}>{title}</div>
    <div>{children}</div>
  </div>;
}
