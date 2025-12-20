import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';
import { Link } from 'react-router-dom';

function Informes() {
  const { logout, getUser } = useAuth();
  const user = getUser();

  const [cardAbierta, setCardAbierta] = useState(null);

  // ==========================
  // MÉTRICAS
  // ==========================
  const [metricas, setMetricas] = useState({
    usuarios_totales: '—',
    clientes_activos: '—',
    clientes_morosos: '—',
    profesores_activos: '—',
    rutinas_totales: '—',
    rutinas_musculacion: '—',
    rutinas_futbol: '—',
    rutinas_spinning: '—'
  });

  const [clientesActivos, setClientesActivos] = useState([]);
  const [clientesMorosos, setClientesMorosos] = useState([]);
  const [profesoresActivos, setProfesoresActivos] = useState([]);

  // ==========================
  // USUARIOS TOTALES
  // ==========================
  useEffect(() => {
    const fetchUsuariosTotales = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/usuarios-totales'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            usuarios_totales: data.total
          }));
        }
      } catch (error) {
        console.error('Error usuarios totales:', error);
      }
    };

    fetchUsuariosTotales();
  }, []);

  // ==========================
  // CLIENTES ACTIVOS
  // ==========================
  useEffect(() => {
    const fetchClientesActivos = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/clientes-activos'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            clientes_activos: data.total
          }));
          setClientesActivos(data.clientes);
        }
      } catch (error) {
        console.error('Error clientes activos:', error);
      }
    };

    fetchClientesActivos();
  }, []);

  // ==========================
  // CLIENTES MOROSOS
  // ==========================
  useEffect(() => {
    const fetchClientesMorosos = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/clientes-morosos'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            clientes_morosos: data.total
          }));
          setClientesMorosos(data.clientes);
        }
      } catch (error) {
        console.error('Error clientes morosos:', error);
      }
    };

    fetchClientesMorosos();
  }, []);

  // ==========================
  // PROFESORES ACTIVOS
  // ==========================
  useEffect(() => {
    const fetchProfesoresActivos = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/profesores-activos'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            profesores_activos: data.total
          }));
          setProfesoresActivos(data.profesores);
        }
      } catch (error) {
        console.error('Error profesores activos:', error);
      }
    };

    fetchProfesoresActivos();
  }, []);

  // ==========================
  // RUTINAS TOTALES ACTIVAS
  // ==========================
  useEffect(() => {
    const fetchRutinasTotales = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/rutinas-totales'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            rutinas_totales: data.total
          }));
        }
      } catch (error) {
        console.error('Error rutinas totales:', error);
      }
    };

    fetchRutinasTotales();
  }, []);

  // ==========================
  // RUTINAS DE MUSCULACIÓN
  // ==========================
  useEffect(() => {
    const fetchRutinasMusculacion = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/rutinas-musculacion'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            rutinas_musculacion: data.total
          }));
        }
      } catch (error) {
        console.error('Error rutinas musculación:', error);
      }
    };

    fetchRutinasMusculacion();
  }, []);

  // ==========================
  // RUTINAS DE FÚTBOL
  // ==========================
  useEffect(() => {
    const fetchRutinasFutbol = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/rutinas-futbol'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            rutinas_futbol: data.total
          }));
        }
      } catch (error) {
        console.error('Error rutinas fútbol:', error);
      }
    };

    fetchRutinasFutbol();
  }, []);

  // ==========================
  // RUTINAS DE SPINNING Y PILATES
  // ==========================
  useEffect(() => {
    const fetchRutinasSpinning = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/metricas/rutinas-spinning'
        );
        const data = await res.json();

        if (data.success) {
          setMetricas(prev => ({
            ...prev,
            rutinas_spinning: data.total
          }));
        }
      } catch (error) {
        console.error('Error rutinas spinning:', error);
      }
    };

    fetchRutinasSpinning();
  }, []);

  // ==========================
  // CARDS
  // ==========================
  const cards = [
    {
      id: 'usuarios_totales',
      titulo: 'Usuarios totales',
      valor: metricas.usuarios_totales,
      descripcion: 'Incluye usuarios activos e inactivos'
    },
    {
      id: 'clientes_activos',
      titulo: 'Clientes activos',
      valor: metricas.clientes_activos,
      descripcion: 'Clientes con cuenta activa'
    },
    {
      id: 'clientes_morosos',
      titulo: 'Clientes morosos',
      valor: metricas.clientes_morosos,
      descripcion: 'Clientes con pagos pendientes'
    },
    {
      id: 'profesores_activos',
      titulo: 'Profesores activos',
      valor: metricas.profesores_activos,
      descripcion: 'Profesores habilitados actualmente'
    },
    {
      id: 'rutinas_totales',
      titulo: 'Rutinas totales',
      valor: metricas.rutinas_totales,
      descripcion: 'Cantidad total de rutinas cargadas'
    },
    {
      id: 'rutinas_musculacion',
      titulo: 'Rutinas de musculación',
      valor: metricas.rutinas_musculacion,
      descripcion: 'Clientes con rutinas de musculación'
    },
    {
      id: 'rutinas_futbol',
      titulo: 'Rutinas de fútbol',
      valor: metricas.rutinas_futbol,
      descripcion: 'Clientes con rutinas de fútbol'
    },
    {
      id: 'rutinas_spinning',
      titulo: 'Rutinas de spinning y pilates',
      valor: metricas.rutinas_spinning,
      descripcion: 'Clientes con rutinas de spinning y pilates'
    }
  ];

  const toggleCard = (id) => {
    setCardAbierta(prev => (prev === id ? null : id));
  };

  if (!user) return null;

  return (
    <>
      <header className="headerPrincipal">
        <div className="logo">
          <img src={loginImage} alt="Logo Gym Nex" />
        </div>

        <h2>Informes generales</h2>

        <nav className="navBar">
          <ul>
            <li>
              <Link to="/principal">Panel de datos</Link>
            </li>

            <li>
              <a
                href="/"
                className="logout-link"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                Cerrar sesión
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="clientesMain">
        <section className="listadoRutinas">
          {cards.map(card => (
            <article key={card.id} className="cardRutina">
              <h3>{card.titulo}</h3>

              <span className="disciplina">{card.valor}</span>

              <button onClick={() => toggleCard(card.id)}>
                {cardAbierta === card.id
                  ? 'Ocultar detalle'
                  : 'Ver detalle'}
              </button>

              <div
                className={`detalleRutina ${
                  cardAbierta === card.id ? 'activa' : ''
                }`}
              >
                {cardAbierta === card.id && (
                  <>
                    {/* DETALLE ESPECIAL: CLIENTES ACTIVOS */}
                    {card.id === 'clientes_activos' && (
                      clientesActivos.length > 0 ? (
                        <ul className="listaDetalle">
                          {clientesActivos.map((c, index) => (
                            <li key={index} style={{ marginBottom: '10px' }}>
                              <div>
                                - {c.nombre} {c.apellido}
                              </div>
                              {c.disciplinas && c.disciplinas.length > 0 ? (
                                <div style={{ 
                                  color: '#666', 
                                  marginLeft: '15px', 
                                  fontSize: '0.85em',
                                  marginTop: '2px'
                                }}>
                                  {c.disciplinas.map((disciplina, idx) => (
                                    <span key={idx} style={{ 
                                      display: 'inline-block',
                                      backgroundColor: '#e8f5e9',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      marginRight: '5px',
                                      marginTop: '3px',
                                      border: '1px solid #c8e6c9'
                                    }}>
                                      {disciplina}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ 
                                  color: '#999', 
                                  marginLeft: '15px', 
                                  fontSize: '0.85em',
                                  fontStyle: 'italic',
                                  marginTop: '2px'
                                }}>
                                  Sin disciplinas asignadas
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hay clientes activos</p>
                      )
                    )}

                    {/* DETALLE ESPECIAL: CLIENTES MOROSOS */}
                    {card.id === 'clientes_morosos' && (
                      clientesMorosos.length > 0 ? (
                        <ul className="listaDetalle">
                          {clientesMorosos.map((c, index) => (
                            <li key={index} style={{ 
                              
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div>
                                  <div>
                                    -{c.nombre} {c.apellido}
                                  </div>
                                  <div style={{ 
                                   
                                  }}>
                                    DNI: {c.dni}
                                  </div>
                                </div>
                                
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ 
                          color: '#4CAF50', 
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '15px'
                        }}>
                          ✅ No hay clientes morosos
                        </p>
                      )
                    )}

                    {/* DETALLE ESPECIAL: PROFESORES ACTIVOS */}
                    {card.id === 'profesores_activos' && (
                      profesoresActivos.length > 0 ? (
                        <ul className="listaDetalle">
                          {profesoresActivos.map((p, index) => (
                            <li key={index} style={{ marginBottom: '10px' }}>
                              <div>
                                - {p.nombre} {p.apellido}
                              </div>
                              {p.disciplinas && p.disciplinas.length > 0 ? (
                                <div style={{ 
                                  color: '#666', 
                                  marginLeft: '15px', 
                                  fontSize: '0.85em',
                                  marginTop: '2px'
                                }}>
                                  {p.disciplinas.map((disciplina, idx) => (
                                    <span key={idx} style={{ 
                                      display: 'inline-block',
                                      backgroundColor: '#e3f2fd',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      marginRight: '5px',
                                      marginTop: '3px',
                                      border: '1px solid #bbdefb'
                                    }}>
                                      {disciplina}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ 
                                  color: '#999', 
                                  marginLeft: '15px', 
                                  fontSize: '0.85em',
                                  fontStyle: 'italic',
                                  marginTop: '2px'
                                }}>
                                  Sin disciplinas asignadas
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hay profesores activos</p>
                      )
                    )}

                    {/* DETALLE GENERAL PARA RUTINAS Y OTRAS CARDS */}
                    {card.id !== 'clientes_activos' && 
                     card.id !== 'clientes_morosos' && 
                     card.id !== 'profesores_activos' && (
                      <p>{card.descripcion}</p>
                    )}
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

export default Informes;