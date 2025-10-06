import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import loginImage from './img/Nex.png';

function CambioContrasena() {
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState('solicitud');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) setModo('cambio');
  }, [token]);

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    if (name === 'nuevaPassword') setNuevaPassword(value);
    if (name === 'confirmarPassword') setConfirmarPassword(value);
    if (error) setError('');
  };

  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/solicitarRecuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      console.log('Respuesta de solicitud de recuperación:', data);

      if (!response.ok) throw new Error(data.error || 'Error al enviar el email de recuperación');

      setMessage('Si el email existe en nuestro sistema, recibirás un enlace de recuperación');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!nuevaPassword || !confirmarPassword) {
      setError('Ambas contraseñas son requeridas');
      setLoading(false);
      return;
    }

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/cambiarPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword })
      });

      const data = await response.json();
      console.log('Respuesta de cambiarPassword:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      setMessage('Contraseña cambiada exitosamente');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header></header>
      <main className='mainSeparado'>
        <aside className='logoAside'>
          <div className="logoLogin">
            <img src={loginImage} className="logoImagen" alt="Logo GymNex"/>
          </div>
          <div className="fraseLogin">
            <p>¡A entrenar con todo!</p>
          </div>
        </aside>
        <section>
          <h1>Recuperar Contraseña</h1>

          <div className='volverInicioSesion'>
            <Link to="/">Volver a inicio de sesión</Link>
          </div>

          <div className='form'>
            {modo === 'solicitud' ? (
              <form onSubmit={handleSolicitarRecuperacion}>
                <div className="inputs">
                  <div className='instrucciones'>
                    <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
                  </div>
                  <input type="email" id="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Ingrese su email" disabled={loading} required/>
                </div>
                {error && <div className="credencialesInvalidas">{error}</div>}
                {message && <div className="mensajeExito">{message}</div>}
                <div className='botonIngresarCentrar'>
                  <button type="submit" className="botonIngresar" disabled={loading}>
                    {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCambiarPassword}>
                <div className="inputs">
                  <div className='instrucciones'>
                    <p>Ingresa tu nueva contraseña y confírmala.</p>
                  </div>
                  <label htmlFor="nuevaPassword">Nueva Contraseña:</label>
                  <input type="password" id="nuevaPassword" name="nuevaPassword" value={nuevaPassword} onChange={handleChangePassword} placeholder="Ingrese nueva contraseña" disabled={loading} required minLength="8"/>
                  <label htmlFor="confirmarPassword">Confirmar Contraseña:</label>
                  <input type="password" id="confirmarPassword" name="confirmarPassword" value={confirmarPassword} onChange={handleChangePassword} placeholder="Confirme su contraseña" disabled={loading} required minLength="8"/>
                </div>
                {error && <div className="credencialesInvalidas">{error}</div>}
                {message && <div className="mensajeExito">{message}</div>}
                <div className='botonIngresarCentrar'>
                  <button type="submit" className="botonIngresar" disabled={loading}>
                    {loading ? 'CAMBIANDO...' : 'CAMBIAR CONTRASEÑA'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default CambioContrasena;
