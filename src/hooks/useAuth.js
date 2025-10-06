import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const logout = () => {
    console.log('Cerrando sesión...');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/', { replace: true });
  };

  const getUser = () => {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  return { logout, getUser };
}
