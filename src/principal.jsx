import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';
import FormRutinas from './scss/components/FormRutinas';
import { Link } from 'react-router-dom';

function Principal() {
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);

  // NUEVO ESTADO: Para controlar el estado de deudor del cliente seleccionado
  const [deudorState, setDeudorState] = useState({
    esDeudor: false,
    cargando: false,
    error: null
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_de_nacimiento: '',
    email: '',
    rol: '',
    disciplinas: []
  });

  const [dniError, setDniError] = useState(''); // 🔴 Estado para error de DNI (solo se muestra al intentar enviar)
  const [formSubmitted, setFormSubmitted] = useState(false); // 🔴 Para controlar cuándo mostrar errores

  const disciplinasMap = {
    futbol: 1,
    musculacion: 2,
    spinningPilates: 3
  };

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      logout();
    } else {
      // Convertimos el ID del rol a texto
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
    }
  }, [logout, getUser]);

  useEffect(() => {
    if (user && user.rol === "profesor") {
      setFormData(prev => ({
        ...prev,
        rol: "cliente"   // obligatoriamente cliente
      }));
    }
  }, [user]);

  // 🔴 Función para validar DNI
  const validarDNI = (dni) => {
    const dniStr = dni.toString();
    if (dniStr.length !== 8) {
      return 'El DNI debe tener exactamente 8 dígitos';
    }
    if (!/^\d+$/.test(dniStr)) {
      return 'El DNI solo puede contener números';
    }
    return '';
  };

  // ============================================================================
  // FUNCIÓN PARA OBTENER EL ESTADO DE DEUDOR DEL CLIENTE
  // ============================================================================
  const obtenerEstadoDeudor = async (idUsuario) => {
    if (!idUsuario) {
      // Si no hay usuario, resetear estado
      setDeudorState({ esDeudor: false, cargando: false, error: null });
      return;
    }

    // Solo consultar si el usuario seleccionado es un cliente
    if (selectedUser && selectedUser.rol !== 'cliente') {
      setDeudorState({ esDeudor: false, cargando: false, error: null });
      return;
    }

    setDeudorState(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const res = await fetch(`http://localhost:3000/api/cliente-estado/${idUsuario}`);
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setDeudorState({
          esDeudor: data.deudor,
          cargando: false,
          error: null
        });
      } else {
        // Si el usuario no es cliente (ej: es profesor/admin), no mostrar error
        if (data.error && data.error.includes('no encontrado')) {
          setDeudorState({ esDeudor: false, cargando: false, error: null });
        } else {
          setDeudorState({ 
            esDeudor: false, 
            cargando: false, 
            error: data.error || 'Error al obtener estado' 
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener estado de deudor:', error);
      setDeudorState({ 
        esDeudor: false, 
        cargando: false, 
        error: 'No se pudo conectar con el servidor' 
      });
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value) {
      setResults([]);
      setError('');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/busqueda?search=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok) {
        setResults([]);
        setError(data.error || 'Error en la búsqueda');
        return;
      }

      if (data.length === 0) {
        setResults([]);
        setError('No se encuentra un usuario con esos datos');
      } else {
        setResults(data);
        setError('');
      }

    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const seleccionarUsuario = (u) => {
    const disciplinasNormalizadas = u.disciplinas
      ? u.disciplinas.map(d => {
          if (d.id === 1) return 'futbol';
          if (d.id === 2) return 'musculacion';
          if (d.id === 3) return 'spinningPilates';
          return null;
        }).filter(Boolean)
      : [];

    setSelectedUser({
      ...u,
      disciplinas: disciplinasNormalizadas
    });

    setFormData({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      dni: u.dni || '',
      fecha_de_nacimiento: u.fecha_de_nacimiento
        ? u.fecha_de_nacimiento.split('T')[0]
        : '',
      email: u.email || '',
      rol: u.rol ? u.rol.trim().toLowerCase() : '',
      disciplinas: disciplinasNormalizadas
    });

    setMessage('');
    setError('');
    setDniError(''); // 🔴 Limpiar error de DNI al seleccionar usuario
    setFormSubmitted(false); // 🔴 Resetear estado de envío

    // ============================================================================
    // LLAMAR A LA FUNCIÓN PARA OBTENER EL ESTADO DE DEUDOR
    // ============================================================================
    obtenerEstadoDeudor(u.idUsuario);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 🔴 Manejo especial para DNI
    if (name === 'dni') {
      // Solo permitir números y limitar a 8 dígitos
      const soloNumeros = value.replace(/\D/g, '');
      const dniLimitado = soloNumeros.slice(0, 8);
      
      setFormData(prev => ({ ...prev, [name]: dniLimitado }));
      
      // 🔴 Si el formulario ya fue enviado y hay error, validar en tiempo real
      if (formSubmitted) {
        const error = validarDNI(dniLimitado);
        setDniError(error);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      disciplinas: checked
        ? [...prev.disciplinas, value]
        : prev.disciplinas.filter(d => d !== value)
    }));
  };

  // ============================================================================
  // EFFECT PARA ACTUALIZAR ESTADO DE DEUDOR CUANDO CAMBIA EL USUARIO SELECCIONADO
  // ============================================================================
  useEffect(() => {
    if (selectedUser && selectedUser.rol === 'cliente') {
      obtenerEstadoDeudor(selectedUser.idUsuario);
    } else {
      setDeudorState({ esDeudor: false, cargando: false, error: null });
    }
  }, [selectedUser]);

  // --------------------------------------------
  //  CREAR USUARIO
  // --------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setFormSubmitted(true); // 🔴 Marcar que se intentó enviar el formulario

    // 🔴 Validar DNI
    const dniValidationError = validarDNI(formData.dni);
    if (dniValidationError) {
      setDniError(dniValidationError);
      setLoading(false);
      return;
    }

    // Validar campos obligatorios
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email || !formData.rol) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    // Validar disciplinas para clientes y profesores
    if ((formData.rol === 'cliente' || formData.rol === 'profesor') &&
        formData.disciplinas.length === 0) {
      setError('Debe seleccionar al menos una disciplina');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contraseña: formData.dni,
          disciplinasIds: formData.disciplinas.map(d => disciplinasMap[d])
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Si el backend devuelve error de DNI, mostrarlo
        if (data.error && data.error.includes('DNI')) {
          setDniError(data.error);
        }
        throw new Error(data.error || 'Error al crear el usuario');
      }

      setMessage('✅ Usuario creado exitosamente');

      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_de_nacimiento: '',
        email: '',
        rol: '',
        disciplinas: []
      });

      setSelectedUser(null);
      setDniError(''); // 🔴 Limpiar error de DNI
      setFormSubmitted(false); // 🔴 Resetear estado de envío
      setDeudorState({ esDeudor: false, cargando: false, error: null }); // Limpiar estado de deudor

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------
  //  ACTUALIZAR USUARIO
  // --------------------------------------------
  const handleActualizarUsuario = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage('');
    setError('');
    setFormSubmitted(true); // 🔴 Marcar que se intentó enviar el formulario

    // 🔴 Validar DNI
    const dniValidationError = validarDNI(formData.dni);
    if (dniValidationError) {
      setDniError(dniValidationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${selectedUser.idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          disciplinasIds: formData.disciplinas.map(d => disciplinasMap[d])
        })
      });

      const data = await res.json();

      if (!data.success) {
        // Si el backend devuelve error de DNI, mostrarlo
        if (data.error && data.error.includes('DNI')) {
          setDniError(data.error);
        }
        setError(data.error || 'Error al actualizar usuario');
        setLoading(false);
        return;
      }

      setMessage('✅ Usuario actualizado correctamente');

      // Mantener usuario seleccionado actualizado
      setSelectedUser(prev => ({
        ...prev,
        ...formData,
        disciplinas: formData.disciplinas
      }));

      setDniError(''); // 🔴 Limpiar error de DNI
      setFormSubmitted(false); // 🔴 Resetear estado de envío

      // ============================================================================
      // ACTUALIZAR ESTADO DE DEUDOR DESPUÉS DE ACTUALIZAR USUARIO
      // ============================================================================
      if (formData.rol === 'cliente') {
        obtenerEstadoDeudor(selectedUser.idUsuario);
      }

    } catch (err) {
      setError('Error interno al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async () => {
    if (!selectedUser) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar a ${selectedUser.nombre} ${selectedUser.apellido}?`
    );

    if (!confirmar) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${selectedUser.idUsuario}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Error al eliminar usuario');
        setLoading(false);
        return;
      }

      setMessage('🗑 Usuario eliminado correctamente');

      // Limpia todo
      setSelectedUser(null);
      setResults([]);
      setSearch('');

      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_de_nacimiento: '',
        email: '',
        rol: '',
        disciplinas: []
      });

      setDniError(''); // 🔴 Limpiar error de DNI
      setFormSubmitted(false); // 🔴 Resetear estado de envío
      setDeudorState({ esDeudor: false, cargando: false, error: null }); // Limpiar estado de deudor

    } catch (err) {
      setError('Error interno al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando autenticación...</div>;

  return (
    <>
      <header className="headerPrincipal">
        <div className="logo">
          <img src={loginImage} alt="Logo Gym Nex" />
        </div>
        <h2>¡Bienvenido/a, {user?.nombre || 'Usuario'}!</h2>

        <nav className="navBar">
          <ul>
            {/* SOLO ADMINISTRADOR - Métricas */}
            {user?.rol === 'administrador' && (
              <li>
                <a href="/informes">Métricas</a>
              </li>
            )}

            {/* SOLO PROFESOR - Ver mis rutinas */}
            {user?.rol === 'profesor' && (
              <li>
                <a href="/principalClientes">Mis Rutinas</a>
              </li>
            )}
        
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

      <main className='mainPrincipal mainTresColumnas'>
        <aside className='busquedaUsuarios'>
          <div className="busqueda-container">
            <h3>Búsqueda de usuario</h3>

            <input type="text" placeholder="Ingrese nombre..." value={search} onChange={handleSearch} />
            {/* {error && <p className="mensaje-error">{error}</p>} */}

            <ul className="resultados">
              {results.map((u) => (
                <li
                  key={u.idUsuario}
                  onClick={() => seleccionarUsuario(u)}
                  className={`item-usuario ${selectedUser?.idUsuario === u.idUsuario ? "item-usuario-seleccionado" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="icono-usuario">👤</span> {u.nombre} {u.apellido}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="contenidoPrincipal">
          {/* ============================================================================ */}
          {/* TÍTULO CON INDICADOR DE DEUDOR */}
          {/* ============================================================================ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Datos del usuario</h2>
            
            {selectedUser && selectedUser.rol === 'cliente' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {deudorState.cargando ? (
                  <span style={{ 
                    fontSize: '0.9em', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    Verificando estado...
                  </span>
                ) : deudorState.error ? (
                  <span style={{ 
                    fontSize: '0.9em', 
                    color: '#ff6b6b',
                    backgroundColor: '#fff5f5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ffcccc'
                  }}>
                    Error: {deudorState.error}
                  </span>
                ) : (
                  <span 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      backgroundColor: deudorState.esDeudor ? '#ffebee' : '#e8f5e9',
                      color: deudorState.esDeudor ? '#c62828' : '#2e7d32',
                      border: deudorState.esDeudor ? '1px solid #ef9a9a' : '1px solid #a5d6a7'
                    }}
                  >
                    {deudorState.esDeudor ? (
                      <>
                        <span style={{ marginRight: '6px' }}>⚠️</span>
                        Deudor
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '6px' }}>✅</span>
                        Al día
                      </>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {message && <div className="mensaje-exito">{message}</div>}
          {/* {error && <div className="mensaje-error">{error}</div>} */}

          <form className='formUsuario' onSubmit={handleSubmit}>

            <label><b>Nombre *</b></label>
            <input type="text" name="nombre" className='inputsDatos'
              value={formData.nombre} onChange={handleInputChange} required />

            <label><b>Apellido *</b></label>
            <input type="text" name="apellido" className='inputsDatos'
              value={formData.apellido} onChange={handleInputChange} required />

            <label><b>DNI *</b></label>
            <input 
              type="text" 
              name="dni" 
              className={`inputsDatos ${dniError && formSubmitted ? 'input-error' : ''}`} // 🔴 Clase condicional para error
              value={formData.dni} 
              onChange={handleInputChange} 
              maxLength="8"
              pattern="\d*"
              title="Ingrese 8 dígitos numéricos"
              required 
            />
            {/* 🔴 Mostrar error de DNI solo si se intentó enviar el formulario */}
            {dniError && formSubmitted && (
              <div className="mensaje-error" style={{fontSize: '0.9em', marginTop: '5px', color: '#f44336'}}>
                {dniError}
              </div>
            )}

            <label><b>Fecha de nacimiento *</b></label>
            <input type="date" name="fecha_de_nacimiento" className='inputsDatos'
              value={formData.fecha_de_nacimiento} onChange={handleInputChange} required />

            <label><b>Email *</b></label>
            <input type="email" name="email" className='inputsDatos'
              value={formData.email} onChange={handleInputChange} required />

            <label className="labelRadio"><b>Rol *</b></label>
            <div className="grupoRadio">

              {/* CLIENTE → siempre visible */}
              <label>
                <input
                  type="radio"
                  name="rol"
                  value="cliente"
                  checked={formData.rol === "cliente"}
                  onChange={handleInputChange}
                />
                Cliente
              </label>

              {/* PROFESOR → visible si el logueado NO es profesor */}
              {user?.rol !== "profesor" && (
                <label>
                  <input
                    type="radio"
                    name="rol"
                    value="profesor"
                    checked={formData.rol === "profesor"}
                    onChange={handleInputChange}
                  />
                  Profesor
                </label>
              )}

              {/* ADMINISTRADOR → visible SOLO si el logueado es administrador */}
              {user?.rol === "administrador" && (
                <label>
                  <input
                    type="radio"
                    name="rol"
                    value="administrador"
                    checked={formData.rol === "administrador"}
                    onChange={handleInputChange}
                  />
                  Administrador
                </label>
              )}

            </div>

            {(formData.rol === 'cliente' || formData.rol === 'profesor') && (
              <>
                <label className='labelRadio'><b>Disciplinas *</b></label>
                <div className="grupoCheckbox">
                  <label><input type="checkbox" value="futbol"
                    checked={formData.disciplinas.includes('futbol')}
                    onChange={handleCheckboxChange} /> Fútbol</label>

                  <label><input type="checkbox" value="musculacion"
                    checked={formData.disciplinas.includes('musculacion')}
                    onChange={handleCheckboxChange} /> Musculación</label>

                  <label><input type="checkbox" value="spinningPilates"
                    checked={formData.disciplinas.includes('spinningPilates')}
                    onChange={handleCheckboxChange} /> Spinning y Pilates</label>
                </div>
              </>
            )}

            <div className="botones-usuario">
                      
              {/* CARGAR USUARIO — Siempre visible */}
              <button
                type="submit"
                className="botonCargaUsuario"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Cargar usuario'}
              </button>
                      
              {/* ACTUALIZAR — Solo visible si hay usuario seleccionado */}
              {selectedUser && (
                <button
                  type="button"
                  className="botonActualizarUsuario"
                  onClick={handleActualizarUsuario}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar usuario'}
                </button>
              )}
            
              {/* ELIMINAR — Solo visible si hay usuario seleccionado */}
              {selectedUser && (
                <button
                  type="button"
                  className="botonEliminarUsuario"
                  onClick={handleEliminarUsuario}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar usuario'}
                </button>
              )}
            
            </div>
            
          </form>
        </section>

        <section className="columnaRutinas">
          <FormRutinas selectedUser={selectedUser} />
        </section>
      </main>
    </>
  );
}

export default Principal;