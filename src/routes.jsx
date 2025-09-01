import { Routes, Route } from 'react-router-dom';
import App from './App';
import CambioContrasena from './cambioContrasena';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/cambio-contrasena" element={<CambioContrasena />} />
    </Routes>
  );
}

export default AppRoutes;