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

// Endpoint para cambiar contraseña (ahora con camelCase)
router.post('/cambiarPassword', async (req, res) => {
  const { dni, nuevaPassword } = req.body;

  try {
    // Validaciones
    if (!dni || !nuevaPassword) {
      return res.status(400).json({ 
        error: 'DNI y nueva contraseña son requeridos' 
      });
    }

    if (isNaN(dni)) {
      return res.status(400).json({ 
        error: 'El DNI debe contener solo números' 
      });
    }

    if (nuevaPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar que el usuario existe
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE dni = $1',
      [dni]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró un usuario con ese DNI' 
      });
    }

    // Actualizar la contraseña en la base de datos
    const updateResult = await pool.query(
      'UPDATE usuarios SET contraseña = $1 WHERE dni = $2 RETURNING dni, nombre',
      [nuevaPassword, dni]
    );

    res.json({ 
      success: true,
      message: 'Contraseña actualizada exitosamente',
      user: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor. Intente nuevamente más tarde.' 
    });
  }
});


export default router;