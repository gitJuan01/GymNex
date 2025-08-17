import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '/home/juan/my-app/src/css/styles.css'
import DBStatus from './conexBD.jsx'
import App from './App.jsx'
import LoginForm from './LoginForm.jsx'
import FormUsuario from './cargaUsuarios.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <DBStatus />
      <App></App>
      {/* <LoginForm></LoginForm>
      <FormUsuario /> */} {/* cargaUsuarios.jsx */}
    </StrictMode>,
  )
