import { useRef, useState } from "react";
import { api } from "../lib/api";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const esRef = useRef<EventSource | null>(null);

  const start = () => {
    if (!input.trim()) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setOut("");

    const url = `${api.defaults.baseURL}/api/v1/assistant/stream?prompt=${encodeURIComponent(input)}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      if (e.data === "[DONE]") { es.close(); return; }
      try {
        // OpenRouter manda JSON por chunk; extraemos el delta si existe
        const obj = JSON.parse(e.data);
        const token = obj?.choices?.[0]?.delta?.content ?? obj?.choices?.[0]?.text ?? "";
        if (token) setOut(prev => prev + token);
      } catch {
        // algunos modelos mandan strings simples; los anexamos
        setOut(prev => prev + e.data);
      }
    };
    es.onerror = () => { es.close(); };
    esRef.current = es;
  };

  return (
    <div style={{padding:16, maxWidth:720}}>
      <h2>Asistente Chapín (LLM)</h2>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3} style={{width:"100%"}} placeholder="Ej: Recomiéndame un combo para 6 personas, poco picante y 2 jarros de cacao"/>
      <div style={{marginTop:8, display:"flex", gap:8}}>
        <button onClick={start}>Enviar</button>
        <button onClick={()=>{ esRef.current?.close(); setOut(""); }}>Limpiar</button>
      </div>
      <pre style={{marginTop:12, whiteSpace:"pre-wrap"}}>{out}</pre>
    </div>
  );
}
