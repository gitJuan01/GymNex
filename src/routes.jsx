import { Routes, Route } from 'react-router-dom';
import Login from './App';
import CambioContrasena from './cambioContrasena';
import Principal from './principal';
import ProtectedRoute from './ProtectedRoute';
import Rutinas from './rutinas';
import Clientes from './principalClientes';
import Informes from './informes';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/cambio-contrasena" element={<CambioContrasena />} />

      {/* Profesores y Administradores - Panel de gestión */}
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

      {/* Clientes Y Profesores - Ver sus propias rutinas */}
      <Route
        path="/principalClientes"
        element={
          <ProtectedRoute allowedRoles={['cliente', 'profesor']}>
            <Clientes />
          </ProtectedRoute>
        }
      />

      {/* Solo Administradores - Métricas */}
      <Route
        path="/informes"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <Informes />
          </ProtectedRoute>
        }/>
    </Routes>
  );
}

export default AppRoutes;