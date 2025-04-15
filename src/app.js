import express from 'express';
import cors from 'cors';
import dbStatusRouter from './dbStatus.js';

const app = express();
const PORT = 3000;

app.use(cors()); // 💡 Esto permite que React pueda acceder a tu backend

app.use('/api/db-status', dbStatusRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export default app;
