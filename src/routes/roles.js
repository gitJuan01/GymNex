import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/roles
router.get('/', async (req, res) => {
  try {
    // Asegúrate de usar "idRol" (con R mayúscula) y "rol" como están en la tabla
    const result = await pool.query('SELECT "idRol", rol FROM roles ORDER BY "idRol"');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron roles" });
    }
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ 
      error: 'Error al cargar roles',
      details: error.message
    });
  }
});

export default router;