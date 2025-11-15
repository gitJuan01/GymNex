import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Mapeo de roles a IDs
const rolesMap = {
  cliente: 2,
  profesor: 1,
  administrador: 3
};

router.post('/', async (req, res) => {
  const { 
    nombre, 
    apellido, 
    dni, 
    fecha_de_nacimiento, 
    email, 
    rol,
    contraseña, // llega como DNI pero igual lo recibimos
    disciplinasIds = [] 
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar DNI existente
    const dniExistente = await client.query(
      'SELECT "idUsuario" FROM usuarios WHERE dni = $1',
      [dni]
    );

    if (dniExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    // 2. Validar rol
    const id_rol = rolesMap[rol];
    if (!id_rol) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // 3. Insertar usuario (contraseña = DNI)
    const usuarioRes = await client.query(
      `INSERT INTO usuarios (nombre, apellido, dni, fecha_de_nacimiento, contraseña, id_rol, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "idUsuario"`,
      [nombre, apellido, dni, fecha_de_nacimiento, dni, id_rol, email]
    );

    const idUsuario = usuarioRes.rows[0].idUsuario;

    // ---------------------------
    //   CLIENTE
    // ---------------------------
    if (rol === 'cliente') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const clienteRes = await client.query(
        `INSERT INTO cliente (id_usuario, id_rutina, id_membresia, id_disciplina)
         VALUES ($1, NULL, 1, $2)
         RETURNING idcliente`,
        [idUsuario, disciplinaPrincipal]
      );

      const idCliente = clienteRes.rows[0].idcliente;

      // Insertar TODAS las disciplinas del cliente
      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO cliente_disciplina (id_cliente, id_disciplina)
           VALUES ($1, $2)`,
          [idCliente, idDisc]
        );
      }
    }

    // ---------------------------
    //   PROFESOR
    // ---------------------------
    if (rol === 'profesor') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const profesorRes = await client.query(
        `INSERT INTO profesor (id_usuario, id_disciplina)
         VALUES ($1, $2)
         RETURNING idprofesor`,
        [idUsuario, disciplinaPrincipal]
      );

      const idProfesor = profesorRes.rows[0].idprofesor;

      // Insertar TODAS las disciplinas del profesor
      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO profesor_disciplina (id_profesor, id_disciplina)
           VALUES ($1, $2)`,
          [idProfesor, idDisc]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: 'Usuario creado exitosamente',
      idUsuario
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor al crear usuario' });
  } finally {
    client.release();
  }
});

export default router;
