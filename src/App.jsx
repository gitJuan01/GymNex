import { useState } from 'react'
import loginImage from './img/Nex.png';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [formData, setFormData] = useState({
    dni: '',
    password: '',
    rememberMe: false // Nuevo estado para el checkbox
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Maneja tanto inputs normales como checkbox
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
    // Aquí verás el estado del checkbox en la consola
  };

  return (
    <>
    <header>

    </header>
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
        </div>
        <div className='form'>
            <form onSubmit={handleSubmit}>
              <div className="inputs">
                <label htmlFor="dni">DNI:</label>
                <input type="number" id="dni" name="dni" value={formData.dni} onChange={handleChange} placeholder="Ingrese su DNI" required/>
              </div>
            
              <div className="inputs">
                <label htmlFor="password">Contraseña:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Ingrese su contraseña" required/>
              </div>
              <div className="recordar">
                <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}/>
                <label htmlFor="rememberMe">Recordar</label>
              </div>
              <div className='botonIngresarCentrar'>
              <button type="submit" className="botonIngresar">INICIAR</button>
              </div>
            </form>
          </div>
        
      </section>
    </main>
    </>
  )
}

export default App
