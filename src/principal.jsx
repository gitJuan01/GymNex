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
          <h2>¡Bienvenido {user.nombre || 'Usuario'}!</h2>
        </div>

        <nav className='navBar'>
          <ul>
            <li><a href="/" onClick={(e) => { e.preventDefault(); logout(); }} className="logout-link">Cerrar Sesión</a></li>
            <li>Nuevo usuario</li>
          </ul>
        </nav>
      </header>

        <main className=''>
          <aside className='busquedaUsuarios'>
              <h3>Búsqueda de usuario</h3>
              <input type="text" />
          </aside>
          
        </main>
    </>
  );
}

export default Principal;
