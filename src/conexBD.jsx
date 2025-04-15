// Ejemplo en React (por ejemplo, en Home.jsx)
import { useEffect, useState } from 'react';

function DBStatus() {
  const [status, setStatus] = useState('Cargando...');

  useEffect(() => {
    fetch('http://localhost:3000/api/db-status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setStatus('✅ Base de datos conectada');
        } else {
          setStatus('❌ Error en la base de datos');
        }
      })
      .catch(err => {
        setStatus('❌ No se pudo contactar al backend');
      });
  }, []);

  return <div>{status}</div>;
}

export default DBStatus;
