import { Route, Routes } from "react-router-dom";
import POS from "./pages/POS";
import Combos from "./pages/Combos";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";
import Assistant from "./pages/Assistant";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<POS/>}/>
        <Route path="/combos" element={<Combos/>}/>
        <Route path="/inventario" element={<Inventory/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/assistant" element={<Assistant/>}/>
      </Routes>
    </>
  );
}
