import { useState } from 'react';
import { Link } from 'react-router-dom';
import loginImage from './img/Nex.png';

function CambioContrasena() {
  const [formData, setFormData] = useState({ dni: '', nuevaPassword: '', confirmarPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!formData.dni || !formData.nuevaPassword || !formData.confirmarPassword) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Llamada real al backend (URL actualizada)
      const response = await fetch('http://localhost:3000/api/auth/cambiarPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dni: formData.dni, 
          nuevaPassword: formData.nuevaPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al cambiar la contraseña');

      setMessage('Contraseña cambiada exitosamente');
      setFormData({ dni: '', nuevaPassword: '', confirmarPassword: '' });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header></header>
      <main>
        <aside>
          <div className="logoLogin">
            <img src={loginImage} alt="Imagen descriptiva de login" className="logoImagen"/>
          </div>
          <div className="fraseLogin">
            <p>¡A entrenar con todo!</p>
          </div>
        </aside>
        <section>
          <h1>Cambiar Contraseña</h1>

          <div className='volverInicioSesion'>
            <Link to="/">Volver a inicio de sesión</Link>
          </div>

          <div className='form'>
            <form onSubmit={handleSubmit}>
              <div className="inputs">
                <label htmlFor="dni">DNI:</label>
                <input type="number" id="dni" name="dni" value={formData.dni} onChange={handleChange} placeholder="Ingrese su DNI" disabled={loading} required/>
              </div>

              <div className="inputs">
                <label htmlFor="nuevaPassword">Nueva Contraseña:</label>
                <input type="password" id="nuevaPassword" name="nuevaPassword" value={formData.nuevaPassword} onChange={handleChange} placeholder="Ingrese nueva contraseña" disabled={loading} required/>
              </div>

              <div className="inputs">
                <label htmlFor="confirmarPassword">Confirmar Contraseña:</label>
                <input type="password" id="verificaPassword" name="confirmarPassword" value={formData.confirmarPassword} onChange={handleChange} placeholder="Confirme su contraseña" disabled={loading} required/>
              </div>
              
              {error && <div className="credencialesInvalidas">{error}</div>}
              {message && <div className="mensajeExito">{message}</div>}

              <div className='botonIngresarCentrar'>
                <button type="submit" className="botonIngresar" disabled={loading}>
                  {loading ? 'CARGANDO...' : 'CAMBIAR CONTRASEÑA'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default CambioContrasena;