// routes/dbStatus.js
import express from 'express';
import pool from '../db.js';  // Cambia esto
// en lugar de: import pool from '/home/juan/my-app/src/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
