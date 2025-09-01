import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { dni, contraseña } = req.body;

  try {
    // Validación básica
    if (!dni || !contraseña) {
      return res.status(400).json({ 
        error: 'DNI y contraseña son requeridos' 
      });
    }

    // Validar que el DNI sea numérico
    if (isNaN(dni)) {
      return res.status(400).json({ 
        error: 'El DNI debe contener solo números' 
      });
    }

    // Consulta a la base de datos
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE dni = $1 AND contraseña = $2',
      [dni, contraseña]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Por favor, verifique los datos ingresados' 
      });
    }

    // Respuesta exitosa (sin enviar la contraseña)
    const user = result.rows[0];
    const { password, ...userData } = user;
    
    res.json({ 
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor. Intente nuevamente más tarde.' 
    });
  }
});

export default router;