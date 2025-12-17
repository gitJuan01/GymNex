import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) return res.json([]);

    const query = `
      SELECT 
        u."idUsuario",
        u.nombre,
        u.apellido,
        u.dni,
        u.fecha_de_nacimiento,
        u.email,
        r.rol AS rol,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', d.iddisciplina,
              'nombre', d.nombredisciplina
            )
          ) FILTER (WHERE d.iddisciplina IS NOT NULL),
          '[]'
        ) AS disciplinas
      FROM usuarios u
      JOIN roles r ON r."idRol" = u.id_rol
      LEFT JOIN cliente c ON c.id_usuario = u."idUsuario"
      LEFT JOIN cliente_disciplina cd ON cd.id_cliente = c.idcliente
      LEFT JOIN profesor p ON p.id_usuario = u."idUsuario"
      LEFT JOIN profesor_disciplina pd ON pd.id_profesor = p.idprofesor
      LEFT JOIN disciplina d 
        ON d.iddisciplina = cd.id_disciplina 
        OR d.iddisciplina = pd.id_disciplina
      WHERE 
        (u.nombre ILIKE $1 OR 
         u.apellido ILIKE $1 OR 
         CAST(u.dni AS TEXT) ILIKE $1)
        AND u.activo = TRUE
      GROUP BY 
        u."idUsuario", u.nombre, u.apellido, u.dni, u.fecha_de_nacimiento, u.email, r.rol
      ORDER BY u.apellido ASC
      LIMIT 20;
    `;

    const result = await pool.query(query, [`%${search}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en búsqueda de usuarios:', error);
    res.status(500).json({ error: 'Error en búsqueda de usuarios' });
  }
});


export default router;
