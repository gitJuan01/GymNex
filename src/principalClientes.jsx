import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';


function Clientes() {
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('todas');

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      logout();
    } else {
      setUser(userData);

      // 🔹 MOCK (luego backend)
      setRutinas([
        {
          id: 1,
          nombre: 'Fuerza tren superior',
          disciplina: 'Musculación',
          descripcion: 'Rutina enfocada en pecho, espalda y brazos',
          fecha: '2025-09-10'
        },
        {
          id: 2,
          nombre: 'Resistencia cardiovascular',
          disciplina: 'Funcional',
          descripcion: 'Circuito de alta intensidad',
          fecha: '2025-09-12'
        },
        {
          id: 3,
          nombre: 'Piernas avanzadas',
          disciplina: 'Musculación',
          descripcion: 'Trabajo intenso de piernas y glúteos',
          fecha: '2025-09-15'
        }
      ]);
    }
  }, [logout, getUser]);

  if (!user) return <div className="loading">Cargando...</div>;

  const disciplinas = ['todas', ...new Set(rutinas.map(r => r.disciplina))];

  const rutinasFiltradas =
    disciplinaFiltro === 'todas'
      ? rutinas
      : rutinas.filter(r => r.disciplina === disciplinaFiltro);

  return (
    <>
      {/* 🔹 HEADER ORIGINAL (SIN CAMBIOS) */}
      <header className="headerPrincipal">
        <div className="logo">
          <img src={loginImage} alt="Logo Gym Nex" />
        </div>
        <h2>¡Bienvenido, {user?.nombre || 'Usuario'}!</h2>
        <nav className="navBar">
          <ul>
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="logout-link"
              >
                Cerrar sesión
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* 🔹 CONTENIDO CLIENTE */}
      <main className="clientesMain">

        <section className="filtroRutinas">
          <label htmlFor="disciplina">Filtrar por disciplina:</label>
          <select
            id="disciplina"
            value={disciplinaFiltro}
            onChange={(e) => setDisciplinaFiltro(e.target.value)}
          >
            {disciplinas.map(d => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </section>

        <section className="listadoRutinas">
          {rutinasFiltradas.length === 0 ? (
            <p className="sinRutinas">No hay rutinas para esta disciplina</p>
          ) : (
            rutinasFiltradas.map(rutina => (
              <article key={rutina.id} className="cardRutina">
                <h3>{rutina.nombre}</h3>
                <span className="disciplina">{rutina.disciplina}</span>
                <p>{rutina.descripcion}</p>
                <small>Asignada el {rutina.fecha}</small>
              </article>
            ))
          )}
        </section>

      </main>
    </>
  );
}

export default Clientes;
