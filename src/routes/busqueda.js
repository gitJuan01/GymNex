import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ✅ BÚSQUEDA DE USUARIOS
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;

    if (!search) {
      return res.json([]);
    }

    const query = `
      SELECT "idUsuario", nombre, apellido, dni
      FROM usuarios
      WHERE nombre ILIKE $1
         OR apellido ILIKE $1
         OR CAST(dni AS TEXT) ILIKE $1
      ORDER BY apellido ASC
      LIMIT 20
    `;

    const result = await pool.query(query, [`%${search}%`]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error en búsqueda de usuarios:', error);
    res.status(500).json({ error: 'Error en búsqueda de usuarios' });
  }
});

export default router;
