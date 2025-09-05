import { Routes, Route } from 'react-router-dom';
import Login from './App'; // Ahora importa Login (que es el App.jsx renombrado)
import CambioContrasena from './cambioContrasena';
import Principal from './principal';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} /> {/* Usa Login en lugar de App */}
      <Route path="/cambio-contrasena" element={<CambioContrasena />} />
      <Route path="/principal" element={<Principal />} />
    </Routes>
  );
}

export default AppRoutes;