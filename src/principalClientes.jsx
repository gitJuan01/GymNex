import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';

function Clientes() {
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData) logout();
    else setUser(userData);
  }, [logout, getUser]);

  if (!user) return <div>Cargando...</div>;

  return (
    <>
      <header className="headerPrincipal">
        <div className="logo">
          <img src={loginImage} alt="Logo Gym Nex" />
        </div>
        <h2>¡Bienvenido, {user?.nombre || 'Usuario'}!</h2>
        <nav className="navBar">
          <ul>
            <li>
              <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} className="logout-link">
                Cerrar sesión
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Clientes;
