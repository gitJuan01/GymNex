import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import usuariosRouter from './routes/usuarios.js'; 
import rolesRouter from './routes/roles.js';
import dbStatusRouter from './routes/dbStatus.js';
import authRouter from './routes/auth.js';
import busquedaRouter from './routes/busqueda.js';
import rutinasRouter from './routes/rutinas.js';
import metricasRoutes from './routes/metricas.js';
import clienteEstadoRouter from './routes/clienteEstado.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/auth', authRouter);
app.use('/api/db-status', dbStatusRouter);
app.use('/api/busqueda', busquedaRouter);
app.use('/api/rutinas', rutinasRouter);
app.use('/api/metricas', metricasRoutes);
app.use('/api/cliente-estado', clienteEstadoRouter);


app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
