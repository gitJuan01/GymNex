import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';

function Principal() {
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      logout();
    } else {
      setUser(userData);
    }
  }, [logout, getUser]);

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando autenticación...</div>;
  }

  return (
    <>
      <header>
        <div className='headerCentrado'>
          <h1>Gym Nex</h1>
          <h2>Bienvenido, {user.nombre || 'Usuario'}</h2>
        </div>

        <nav className='navBar'>
          <ul>
            <li>
              <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} className="logout-link">
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </nav>

        <main>
          <div className="dashboard">
            <h3>Panel de Control</h3>
            <div className="user-card">
              <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
              <p><strong>DNI:</strong> {user.dni}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
        </main>
      </header>
    </>
  );
}

export default Principal;
