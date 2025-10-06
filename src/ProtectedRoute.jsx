import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    
    const user = sessionStorage.getItem('user');
    
    if (!user) {
      setIsAuthenticated(false);
    } else {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.dni) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        sessionStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    }
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando acceso...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;