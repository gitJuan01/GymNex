  import { useEffect, useState } from 'react';
  import { useAuth } from './hooks/useAuth';
  import loginImage from './img/nex.png';
  import FormRutinas from './scss/components/FormRutinas';

  function Principal() {
    const { logout, getUser } = useAuth();
    const [user, setUser] = useState(null);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);

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

        disciplinas: u.disciplinas
          ? u.disciplinas.map(d => {
              if (d.id === 1) return 'futbol';
              if (d.id === 2) return 'musculacion';
              if (d.id === 3) return 'spinningPilates';
              return null;
            }).filter(Boolean)
          : []
      });

      setMessage('');
      setError('');
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
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

    // --------------------------------------------
    //  CREAR USUARIO
    // --------------------------------------------
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');
      setError('');

      if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email || !formData.rol) {
        setError('Todos los campos son obligatorios');
        setLoading(false);
        return;
      }

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

        if (!res.ok) throw new Error(data.error || 'Error al crear el usuario');

        setMessage('✅ Usuario creado exitosamente');

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
          <h2>¡Bienvenido, {user?.nombre || 'Usuario'}!</h2>

          <nav className="navBar">
            <ul>
              <li><a href="/principal">Crear Usuario</a></li>
              <li><a href="/rutinas">Cargar rutinas</a></li>
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} className="logout-link">
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
              {error && <p className="mensaje-error">{error}</p>}

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
            <h2>Datos del usuario</h2>

            {message && <div className="mensaje-exito">{message}</div>}
            {error && <div className="mensaje-error">{error}</div>}

            <form className='formUsuario' onSubmit={handleSubmit}>

              <label><b>Nombre</b></label>
              <input type="text" name="nombre" className='inputsDatos'
                value={formData.nombre} onChange={handleInputChange} required />

              <label><b>Apellido</b></label>
              <input type="text" name="apellido" className='inputsDatos'
                value={formData.apellido} onChange={handleInputChange} required />

              <label><b>DNI</b></label>
              <input type="number" name="dni" className='inputsDatos'
                value={formData.dni} onChange={handleInputChange} required />

              <label><b>Fecha de nacimiento</b></label>
              <input type="date" name="fecha_de_nacimiento" className='inputsDatos'
                value={formData.fecha_de_nacimiento} onChange={handleInputChange} required />

              <label><b>Email</b></label>
              <input type="email" name="email" className='inputsDatos'
                value={formData.email} onChange={handleInputChange} required />

              <label className="labelRadio"><b>Rol</b></label>
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
                  <label className='labelRadio'><b>Disciplinas</b></label>
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
