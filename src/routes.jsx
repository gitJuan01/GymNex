import { Routes, Route } from 'react-router-dom';
import Login from './App';
import CambioContrasena from './cambioContrasena';
import Principal from './principal';
import ProtectedRoute from './ProtectedRoute';
import Rutinas from './rutinas';
import Clientes from './principalClientes';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/cambio-contrasena" element={<CambioContrasena />} />

      {/* Profesores y Administradores */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute allowedRoles={['profesor', 'administrador']}>
            <Principal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rutinas"
        element={
          <ProtectedRoute allowedRoles={['profesor', 'administrador']}>
            <Rutinas />
          </ProtectedRoute>
        }
      />

      {/* Solo Clientes */}
      <Route
        path="/principalClientes"
        element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <Clientes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
