import { useState } from 'react';

function LoginForm() {
  const [formData, setFormData] = useState({
    dni: '',
    contraseña: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      setIsError(false);
      setMessage(data.message);
      console.log('Usuario autenticado:', data.user);
      
      // Aquí podrías redirigir o guardar el estado de autenticación
      
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>DNI:</label>
          <input
            type="number"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Ingresar</button>
      </form>

      {message && (
        <div style={{ color: isError ? 'red' : 'green' }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default LoginForm;