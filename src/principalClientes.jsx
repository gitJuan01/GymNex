import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';

function Clientes() {
  const { logout, getUser } = useAuth();

  const [user, setUser] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Estado de deudor - solo para clientes
  const [estadoDeudor, setEstadoDeudor] = useState({
    deudor: false,
    loading: true,
    error: null,
    esCliente: false
  });

  const [detalleRutina, setDetalleRutina] = useState(null);
  const [rutinaAbierta, setRutinaAbierta] = useState(null);

  useEffect(() => {
    const userData = getUser();

    if (!userData) {
      logout();
      return;
    }

    const idUsuario = userData.idUsuario ?? null;

    if (!idUsuario) {
      logout();
      return;
    }

    // Determinar rol del usuario internamente
    const rolesTexto = {
      1: "profesor",
      2: "cliente",
      3: "administrador",
    };
    
    const userNormalizado = {
      ...userData,
      rol: rolesTexto[userData.id_rol] || userData.rol
    };

    setUser(userNormalizado);

    // Cargar estado de deudor SOLO si es cliente
    const cargarEstadoDeudor = async () => {
      // Si es profesor, no cargar estado de deudor
      if (userNormalizado.rol !== 'cliente') {
        setEstadoDeudor({
          deudor: false,
          loading: false,
          error: null,
          esCliente: false
        });
        return;
      }

      try {
        setEstadoDeudor(prev => ({ ...prev, loading: true, esCliente: true }));
        
        const res = await fetch(`http://localhost:3000/api/cliente-estado/${idUsuario}`);
        const data = await res.json();

        if (data.success) {
          setEstadoDeudor({
            deudor: data.deudor,
            loading: false,
            error: null,
            esCliente: true
          });
        } else {
          setEstadoDeudor({
            deudor: false,
            loading: false,
            error: data.error || 'Error al cargar estado',
            esCliente: true
          });
        }
      } catch (error) {
        console.error('Error al cargar estado deudor:', error);
        setEstadoDeudor({
          deudor: false,
          loading: false,
          error: 'Error de conexión',
          esCliente: true
        });
      }
    };

    // Cargar rutinas (funciona tanto para clientes como profesores)
    fetch(`http://localhost:3000/api/rutinas/${idUsuario}`)
      .then(res => res.json())
      .then(data => {
        const rutinasAdaptadas = data.map(r => ({
          id: r.idrutina,
          nombre: r.nombrerutina,
          disciplina: r.nombredisciplina,
          descripcion: 'Rutina asignada'
        }));

        setRutinas(rutinasAdaptadas);
      })
      .catch((error) => {
        console.error('Error cargando rutinas:', error);
        setRutinas([]);
      })
      .finally(() => setLoading(false));

    // Cargar estado de deudor
    cargarEstadoDeudor();

  }, []);

  const cargarDetalle = async (idRutina) => {
    if (rutinaAbierta === idRutina) {
      setRutinaAbierta(null);
      setDetalleRutina(null);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/rutinas/detalle/${idRutina}`
      );

      const data = await res.json();

      setRutinaAbierta(idRutina);
      setDetalleRutina(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para formatear texto con saltos de línea
  const formatearTexto = (texto) => {
    if (!texto) return '';
    return texto.split('\n').map((linea, index) => (
      <span key={index}>
        {linea}
        <br />
      </span>
    ));
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return null;

  const disciplinas = ['todas', ...new Set(rutinas.map(r => r.disciplina))];

  const rutinasFiltradas =
    disciplinaFiltro === 'todas'
      ? rutinas
      : rutinas.filter(r => r.disciplina === disciplinaFiltro);

  return (
    <>
      <header className="headerPrincipal">
        <div className="logo">
          <img src={loginImage} alt="Logo Gym Nex" />
        </div>
        <h2>¡Bienvenido, {user?.nombre || 'Usuario'}!</h2>
        <nav className="navBar">
          {/* Mostrar enlace al panel de gestión para profesores (solo si es profesor) */}
          {user?.rol === 'profesor' && (
            <a href="/principal" className='panelgestion'>
              Panel de Gestión
            </a>
          )}
          <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); logout(); }}>
            Cerrar sesión
          </a>
        </nav>
      </header>

      <main className="clientesMain">
        <section className="filtroRutinas">
          <div className="filtro-grid">
            {/* Filtro de disciplina */}
            <div className="filtro-item">
              <label>Filtrar por disciplina:</label>
              <select
                value={disciplinaFiltro}
                onChange={(e) => setDisciplinaFiltro(e.target.value)}
              >
                {disciplinas.map(d => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de deudor - SOLO para clientes, se muestra automáticamente */}
            {user?.rol === 'cliente' && (
              <div className="filtro-item estado-deudor-container">
                <label>Adeuda cuota:</label>
                <div className="estado-deudor-content">
                  {estadoDeudor.loading ? (
                    <span className="estado-cargando">Cargando...</span>
                  ) : estadoDeudor.error ? (
                    <span className="estado-error">Error</span>
                  ) : (
                    <span className={`estado-texto ${estadoDeudor.deudor ? 'deudor-si' : 'deudor-no'}`}>
                      {estadoDeudor.deudor ? 'Sí' : 'No'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Solo mostrar error si existe y es cliente */}
          {user?.rol === 'cliente' && estadoDeudor.error && (
            <div className="error-message">
              <strong>Aviso:</strong> {estadoDeudor.error}
            </div>
          )}
        </section>

        {/* Mensaje si no hay rutinas */}
        {rutinasFiltradas.length === 0 && !loading && (
          <div className="sin-rutinas-mensaje">
            <p>No tienes rutinas asignadas.</p>
            {user?.rol === 'profesor' && (
              <p className="mensaje-profesor">
                <strong>Nota:</strong> Las rutinas que asignes a tus clientes no aparecen aquí.
                Esta sección solo muestra las rutinas que tienes asignadas para tu propio entrenamiento.
              </p>
            )}
          </div>
        )}

        <section className="listadoRutinas">
          {rutinasFiltradas.map(rutina => (
            <article key={rutina.id} className="cardRutina">
              <h3>{rutina.nombre}</h3>
              <span className="disciplina">{rutina.disciplina}</span>

              <button onClick={() => cargarDetalle(rutina.id)}>
                {rutinaAbierta === rutina.id
                  ? 'Ocultar detalle'
                  : 'Ver detalle'}
              </button>

              <div
                className={`detalleRutina ${
                  rutinaAbierta === rutina.id ? 'activa' : ''
                }`}
              >
                {rutinaAbierta === rutina.id && detalleRutina && (
                  <>
                    <p><strong>Estiramientos:</strong></p>
                    <div className="contenido-detalle">
                      {formatearTexto(detalleRutina.estiramiento)}
                    </div>

                    <p><strong>Ejercicios:</strong></p>
                    <div className="contenido-detalle">
                      {formatearTexto(detalleRutina.ejercicio)}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export default Clientes;