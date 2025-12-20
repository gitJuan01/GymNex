import { useEffect, useState } from 'react';

const DISCIPLINAS_MAP = {
  futbol: { id: 1, label: 'Fútbol' },
  musculacion: { id: 2, label: 'Musculación' },
  spinningPilates: { id: 3, label: 'Spinning y Pilates' }
};

function FormRutinas({ selectedUser }) {
  const [titulo, setTitulo] = useState('');
  const [estiramientos, setEstiramientos] = useState('');
  const [ejercicios, setEjercicios] = useState('');
  const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState('');

  const [rutinas, setRutinas] = useState([]);
  const [selectedRutina, setSelectedRutina] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!selectedUser) {
      setRutinas([]);
      resetForm();
      return;
    }
    cargarRutinas(selectedUser.idUsuario);
  }, [selectedUser]);

  const cargarRutinas = async (idUsuario) => {
    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/${idUsuario}`);
      const data = await res.json();
      setRutinas(res.ok ? data : []);
    } catch {
      setRutinas([]);
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
      setDisciplinaSeleccionada(String(data.id_disciplina)); // 🔹
    }
  };

  const resetForm = () => {
    setTitulo('');
    setEstiramientos('');
    setEjercicios('');
    setDisciplinaSeleccionada('');
    setSelectedRutina(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedUser) return;

  if (!disciplinaSeleccionada) {
    setMsg('Debe seleccionar una disciplina');
    return;
  }

  if (!titulo.trim()) {
    setMsg('Debe ingresar un nombre de rutina');
    return;
  }

  if (!estiramientos.trim() || !ejercicios.trim()) {
    setMsg('Debe completar estiramientos y ejercicios');
    return;
  }

  const res = await fetch('http://localhost:3000/api/rutinas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idUsuario: selectedUser.idUsuario,
      idDisciplina: Number(disciplinaSeleccionada),
      titulo,
      estiramientos,
      ejercicios
    }),
  });

  if (res.ok) {
    setMsg('✅ Rutina guardada');
    resetForm();
    cargarRutinas(selectedUser.idUsuario);
  }
};


  const handleUpdate = async () => {
  if (!selectedRutina) return;

  if (!disciplinaSeleccionada) {
    setMsg('Debe seleccionar una disciplina');
    return;
  }

  if (!titulo.trim()) {
    setMsg('Debe ingresar un nombre de rutina');
    return;
  }

  if (!estiramientos.trim() || !ejercicios.trim()) {
    setMsg('Debe completar estiramientos y ejercicios');
    return;
  }

  const res = await fetch(
    `http://localhost:3000/api/rutinas/${selectedRutina}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        estiramientos,
        ejercicios,
        idDisciplina: Number(disciplinaSeleccionada)
      }),
    }
  );

  if (res.ok) {
    setMsg('✅ Rutina actualizada');
    cargarRutinas(selectedUser.idUsuario);
  }
};


  const handleDelete = async () => {
    if (!selectedRutina) return;
    if (!window.confirm('¿Eliminar rutina?')) return;

    const res = await fetch(`http://localhost:3000/api/rutinas/${selectedRutina}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setMsg('🗑 Rutina eliminada');
      resetForm();
      cargarRutinas(selectedUser.idUsuario);
    }
  };

  return (
    <div className="contenidoRutinas">
      <h2 className="tituloRutinas">Rutinas</h2>

      {!selectedUser && <p>Seleccione un usuario</p>}

      {rutinas.length > 0 && (
        <select className="selectRutinas" onChange={(e) => handleSelectRutina(e.target.value)}>
          <option value="">-- Seleccione rutina --</option>
          {rutinas.map(r => (
            <option key={r.idrutina} value={r.idrutina}>
              {r.nombrerutina}
            </option>
          ))}
        </select>
      )}

      {msg && <p>{msg}</p>}

      {selectedUser && (
        <form className="formRutina" onSubmit={handleSubmit}>

          {/* DISCIPLINA */}
          <label><b>Disciplina *</b></label>
          <select className='selectDisciplinas' value={disciplinaSeleccionada} onChange={e => setDisciplinaSeleccionada(e.target.value)} required>
  <option value="">-- Seleccione disciplina --</option>

  {Array.isArray(selectedUser?.disciplinas) &&
    selectedUser.disciplinas
      .filter(d => DISCIPLINAS_MAP[d])
      .map(d => (
        <option key={d} value={DISCIPLINAS_MAP[d].id}>
          {DISCIPLINAS_MAP[d].label}
        </option>
      ))}
</select>


          <label className="nombreRutina">Nombre de la rutina *</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)} required/>

          <div className="ejerciciosRutina">
            <div className="bloqueRutina">
              <label>Estiramientos</label>
              <textarea
                value={estiramientos}
                onChange={e => setEstiramientos(e.target.value)}
              />
            </div>

            <div className="bloqueRutina">
              <label>Ejercicios</label>
              <textarea
                value={ejercicios}
                onChange={e => setEjercicios(e.target.value)}
              />
            </div>
          </div>

          <div className="centradoTexto">
            <button type="submit" className="botonesRutina">
              Guardar
            </button>

            {selectedRutina && (
              <>
                <button type="button" className="botonActualizar" onClick={handleUpdate}>
                  Actualizar
                </button>
                <button type="button" className="botonEliminar" onClick={handleDelete}>
                  Eliminar
                </button>
              </>
            )}
          </div>

        </form>
      )}
    </div>
  );
}

export default FormRutinas;
