import { useState, useEffect } from 'react';

function FormUsuario() {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_de_nacimiento: '',
    contraseña: '',
    id_rol: ''
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/roles');
        if (!response.ok) throw new Error('Error al cargar roles');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoadingRoles(false);
      }
    };
    
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dni: Number(formData.dni) // Aseguramos que dni sea número
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar usuario');
      }

      alert('✅ Usuario cargado con éxito');
      // Limpiar formulario después del éxito
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_de_nacimiento: '',
        contraseña: '',
        id_rol: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="nombre" 
        placeholder="Nombre" 
        value={formData.nombre}
        onChange={handleChange} 
        required 
      />
      <input 
        name="apellido" 
        placeholder="Apellido" 
        value={formData.apellido}
        onChange={handleChange} 
        required 
      />
      <input 
        name="dni" 
        placeholder="DNI" 
        type="number" 
        value={formData.dni}
        onChange={handleChange} 
        required 
      />
      <input 
        name="fecha_de_nacimiento" 
        type="date" 
        value={formData.fecha_de_nacimiento}
        onChange={handleChange} 
        required 
      />
      <input 
        name="contraseña" 
        placeholder="Contraseña" 
        type="password" 
        value={formData.contraseña}
        onChange={handleChange} 
        required 
      />
      
      <label>
        Rol:
        {loadingRoles ? (
          <p>Cargando roles...</p>
        ) : (
          <select 
            name="id_rol"
            value={formData.id_rol}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.rol}
              </option>
            ))}
          </select>
        )}
      </label>
      
      <button type="submit">Cargar Usuario</button>
    </form>
  );
}

export default FormUsuario;
