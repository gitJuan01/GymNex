import { Routes, Route } from 'react-router-dom';
import Login from './App';
import CambioContrasena from './cambioContrasena';
import Principal from './principal';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cambio-contrasena" element={<CambioContrasena />} />
      <Route path="/principal" element={
        <ProtectedRoute>
          <Principal />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default AppRoutes;