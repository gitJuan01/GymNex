import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const userStored = sessionStorage.getItem('user');

  if (!userStored) {
    return <Navigate to="/" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStored);
  } catch {
    sessionStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  // ✅ Mapeo CORRECTO según tu BD
  const roleMap = {
    1: 'profesor',
    2: 'cliente',
    3: 'administrador',
  };

  const userRole = user.rol || roleMap[user.id_rol];

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
