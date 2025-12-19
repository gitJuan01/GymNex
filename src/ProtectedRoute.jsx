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

  // 🔐 Mapeo de roles según tu BD
  const roleMap = {
    1: 'administrador',
    2: 'cliente',
    3: 'profesor'
  };

  const userRole = roleMap[user.id_rol];

  // 🚫 Si el rol no está permitido → afuera
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
