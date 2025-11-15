// rutinas.jsx actualizado
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import loginImage from './img/nex.png';

function Rutinas() {
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [estiramientos, setEstiramientos] = useState('');
  const [ejercicios, setEjercicios] = useState('');

  const [rutinas, setRutinas] = useState([]);
  const [selectedRutina, setSelectedRutina] = useState(null);

  const [msg, setMsg] = useState('');

  useEffect(() => {
    const userData = getUser();
    if (!userData) logout(); else setUser(userData);
  }, [logout, getUser]);

  const cargarRutinas = async (idUsuario) => {
    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/${idUsuario}`);
      const data = await res.json();
      if (res.ok) setRutinas(data);
      else setRutinas([]);
    } catch (err) {
      console.error('Error cargando rutinas');
      setRutinas([]);
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
        setError(data.error || 'Error al buscar');
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
      setResults([]);
      setError('Error de conexión con el servidor');
    }
  };

  const handleSelectRutina = async (id) => {
    if (!id) return;

    setSelectedRutina(id);
    setMsg('');

    const res = await fetch(`http://localhost:3000/api/rutinas/detalle/${id}`);
    const data = await res.json();

    if (res.ok) {
      setTitulo(data.nombrerutina || '');
      setEstiramientos(data.estiramiento || '');
      setEjercicios(data.ejercicio || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!titulo || !estiramientos || !ejercicios) {
      setMsg('Debe completar todos los campos');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: selectedUser.idUsuario,
          titulo,
          estiramientos,
          ejercicios,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || 'Error al guardar');
        return;
      }

      setMsg('✅ Rutina guardada correctamente');
      setTitulo('');
      setEstiramientos('');
      setEjercicios('');
      setSelectedRutina(null);

      cargarRutinas(selectedUser.idUsuario);

    } catch (err) {
      setMsg('Error al conectar con el servidor');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!selectedRutina) {
      setMsg('Debe seleccionar una rutina');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/${selectedRutina}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, estiramientos, ejercicios }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || 'Error al actualizar');
        return;
      }

      setMsg('✅ Rutina actualizada correctamente');
      cargarRutinas(selectedUser.idUsuario);

    } catch (err) {
      setMsg('Error al conectar con el servidor');
    }
  };

  const handleDelete = async () => {
    if (!selectedRutina) return setMsg("Debe seleccionar una rutina");

    const confirmar = window.confirm("¿Seguro que desea eliminar esta rutina?");
    if (!confirmar) return;

    setMsg('');

    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/${selectedRutina}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        return setMsg(data.error || "Error al eliminar rutina");
      }

      setMsg("✅ Rutina eliminada correctamente");

      setTitulo("");
      setEstiramientos("");
      setEjercicios("");
      setSelectedRutina(null);

      cargarRutinas(selectedUser.idUsuario);

    } catch (err) {
      console.error(err);
      setMsg("Error al conectar con el servidor");
    }
  };

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando autenticación...</div>;

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
            <li><a href="/" onClick={(e) => { e.preventDefault(); logout(); }}className="logout-link">Cerrar sesión</a></li>
          </ul>
        </nav>
      </header>

      <main className='mainPrincipal'>
        <aside className='busquedaUsuarios'>
          <div className="busqueda-container">
            <h3>Búsqueda de usuario</h3>

            <input type="text" placeholder="Ingrese nombre..." value={search} onChange={handleSearch} />
            {error && <p className="mensaje-error">{error}</p>}

            <ul className="resultados">
              {results.map((u) => (
                <li
                  key={u.idUsuario}
                  onClick={() => {
                    setSelectedUser(u);
                    cargarRutinas(u.idUsuario);
                  
                    setTitulo('');
                    setEstiramientos('');
                    setEjercicios('');
                    setSelectedRutina(null);
                    setMsg(''); 
                  }}
                  className={`item-usuario ${selectedUser?.idUsuario === u.idUsuario ? "item-usuario-seleccionado" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="icono-usuario">👤</span> {u.nombre} {u.apellido}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="contenidoRutinas">
          <div className="centradoTexto">
            <h2>Rutinas</h2>
          </div>


          {rutinas.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <label>Seleccionar rutina: </label>
              <select
                value={selectedRutina || ""}
                onChange={(e) => handleSelectRutina(e.target.value)}
              >
                <option value="">-- Seleccione --</option>
                {rutinas.map((r) => (
                  <option key={r.idrutina} value={r.idrutina}>{r.nombrerutina}</option>
                ))}
              </select>
            </div>
          )}

          {msg && <p style={{ marginTop: 10 }}>{msg}</p>}

          {selectedUser && (
            <form className='formRutina' onSubmit={handleSubmit}>
              <label>Título: </label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

              <div className='ejerciciosRutina'>
                <div className="bloqueRutina">
                  <label>Estiramientos: </label>
                  <textarea value={estiramientos} onChange={(e) => setEstiramientos(e.target.value)}></textarea>
                </div>

                <div className="bloqueRutina">
                  <label>Ejercicios: </label>
                  <textarea value={ejercicios} onChange={(e) => setEjercicios(e.target.value)}></textarea>
                </div>
              </div>

              <button className='botonesRutina' type="submit">Guardar</button>

              {selectedRutina && (
                <>
                  <button className='botonActualizar' type="button" onClick={handleUpdate}>
                      Actualizar
                  </button>

                  <button className='botonEliminar' type="button" onClick={handleDelete}>
                    Eliminar
                  </button>
                </>
              )}
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default Rutinas;
