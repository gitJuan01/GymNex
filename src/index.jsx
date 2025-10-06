import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '/home/juan/my-app/src/css/styles.css'
import DBStatus from './conexBD.jsx'
import AppRoutes from './routes.jsx'
import FormUsuario from './cargaUsuarios.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
      {/* <FormUsuario></FormUsuario> */}
    </BrowserRouter>
  </StrictMode>,
)