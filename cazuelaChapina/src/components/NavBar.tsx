import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav style={{display:"flex",gap:12,padding:12,borderBottom:"1px solid #ddd"}}>
      <Link to="/">POS</Link>
      <Link to="/combos">Combos</Link>
      <Link to="/inventario">Inventario</Link>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}
