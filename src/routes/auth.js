import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { dni, contraseña } = req.body;

  try {
    // 1. Validar que lleguen los datos
    if (!dni || !contraseña) {
      return res.status(400).json({ error: 'DNI y contraseña son requeridos' });
    }

    // 2. Consultar la base de datos
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE dni = $1 AND contraseña = $2',
      [dni, contraseña]
    );

    // 3. Verificar si el usuario existe
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 4. Si todo es correcto
    res.json({ 
      success: true,
      message: 'Usuario autenticado correctamente',
      user: result.rows[0] 
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;