import { useState } from 'react';
import loginImage from './img/Nex.png';
import { Link } from 'react-router-dom';

function App() {
  const [formData, setFormData] = useState({ dni: '', password: '', rememberMe: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: formData.dni, contraseña: formData.password })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error en la autenticación');

      if (formData.rememberMe) {
        localStorage.setItem('userData', JSON.stringify({ dni: formData.dni, password: formData.password }));
      }

      alert('¡Ingreso exitoso!');
      console.log('Usuario autenticado:', data.user);

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
          <h1>¡Bienvenido!</h1>
          <div className='titulo'>
            <h3>Ingrese sus datos</h3>
          </div>
          <div className='form'>
            <form onSubmit={handleSubmit}>
              
              <div className="inputs">
                <label htmlFor="dni">DNI:</label>
                <input type="number" id="dni" name="dni" value={formData.dni} onChange={handleChange} placeholder="Ingrese su DNI" disabled={loading}/>
              </div>
            
              <div className="inputs">
                <label htmlFor="password">Contraseña:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Ingrese su contraseña" disabled={loading}/>
              </div>
              
              <div className="recordar">
                <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} disabled={loading}/>
                <label htmlFor="rememberMe">Recordar</label>
              </div>
              
              <div className='cambioContraseña'>
                <Link to="/cambio-contrasena">¿Olvidaste tu contraseña?</Link>
              </div>
              {error && <div className="credencialesInvalidas">{error}</div>}

              <div className='botonIngresarCentrar'>
                <button type="submit" className="botonIngresar" disabled={loading}>
                  {loading ? 'CARGANDO...' : 'INICIAR'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;