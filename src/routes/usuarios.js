import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST /api/usuarios
router.post('/', async (req, res) => {
    const { 
      nombre, 
      apellido, 
      dni, 
      fecha_de_nacimiento, 
      contraseña, 
      id_rol
    } = req.body;
  
    try {
      const query = `
        INSERT INTO usuarios 
        (nombre, apellido, dni, fecha_de_nacimiento, "contraseña", id_rol)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "idUsuario", nombre, id_rol;
      `;
      
      const values = [
        nombre, 
        apellido, 
        dni, 
        fecha_de_nacimiento, 
        contraseña, 
        id_rol
      ];
      
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ 
        error: 'Error al insertar usuario',
        details: error.message
      });
    }
  });

  export default router;