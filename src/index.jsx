import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '/home/juan/my-app/src/css/styles.css'
import DBStatus from './conexBD.jsx'
import AppRoutes from './routes.jsx' // Importa el nuevo componente de rutas

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* <DBStatus /> */}
      <AppRoutes /> {/* Usa AppRoutes en lugar de App */}
    </BrowserRouter>
  </StrictMode>,
)