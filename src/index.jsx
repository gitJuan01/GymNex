import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Importa BrowserRouter
import '/home/juan/my-app/src/css/styles.css'
import DBStatus from './conexBD.jsx'
import AppRoutes from './routes.jsx' // Usa AppRoutes en lugar de App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Envuelve con BrowserRouter */}
      <AppRoutes /> {/* Usa AppRoutes que maneja todas las rutas */}
    </BrowserRouter>
  </StrictMode>,
)