import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Mapeo de roles a IDs
const rolesMap = {
  cliente: 2,
  profesor: 1,
  administrador: 3
};

/* =====================================================
 *                CREAR USUARIO
 * ===================================================== */
router.post('/', async (req, res) => {
  const { 
    nombre, 
    apellido, 
    dni, 
    fecha_de_nacimiento, 
    email, 
    rol,
    contraseña,
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

    // 3. Insertar usuario
    const usuarioRes = await client.query(
      `INSERT INTO usuarios (nombre, apellido, dni, fecha_de_nacimiento, contraseña, id_rol, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "idUsuario"`,
      [nombre, apellido, dni, fecha_de_nacimiento, dni, id_rol, email]
    );

    const idUsuario = usuarioRes.rows[0].idUsuario;

    /* ---------------------------
     *        CLIENTE
     * --------------------------- */
    if (rol === 'cliente') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const clienteRes = await client.query(
        `INSERT INTO cliente (id_usuario, id_membresia, id_disciplina)
         VALUES ($1, 1, $2)
         RETURNING idcliente`,
        [idUsuario, disciplinaPrincipal]
      );

      const idCliente = clienteRes.rows[0].idcliente;

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO cliente_disciplina (id_cliente, id_disciplina)
           VALUES ($1, $2)`,
          [idCliente, idDisc]
        );
      }
    }

    /* ---------------------------
     *        PROFESOR
     * --------------------------- */
    if (rol === 'profesor') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const profesorRes = await client.query(
        `INSERT INTO profesor (id_usuario, id_disciplina)
         VALUES ($1, $2)
         RETURNING idprofesor`,
        [idUsuario, disciplinaPrincipal]
      );

      const idProfesor = profesorRes.rows[0].idprofesor;

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

/* =====================================================
 *                ACTUALIZAR USUARIO
 * ===================================================== */
router.put('/:id', async (req, res) => {
  const idUsuario = req.params.id;

  const {
    nombre,
    apellido,
    dni,
    fecha_de_nacimiento,
    email,
    rol,
    disciplinasIds = []
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validar rol nuevo
    const id_rol_nuevo = rolesMap[rol];
    if (!id_rol_nuevo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // Obtener rol original
    const rolOriginal = await client.query(
      `SELECT id_rol FROM usuarios WHERE "idUsuario" = $1`,
      [idUsuario]
    );

    if (rolOriginal.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_rol_original = rolOriginal.rows[0].id_rol;

    // Validar DNI duplicado
    const dniExistente = await client.query(
      `SELECT "idUsuario" FROM usuarios WHERE dni = $1 AND "idUsuario" <> $2`,
      [dni, idUsuario]
    );

    if (dniExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El DNI ya está registrado por otro usuario' });
    }

    // Actualizar datos básicos
    await client.query(
      `UPDATE usuarios
       SET nombre = $1,
           apellido = $2,
           dni = $3,
           fecha_de_nacimiento = $4,
           email = $5,
           id_rol = $6
       WHERE "idUsuario" = $7`,
      [nombre, apellido, dni, fecha_de_nacimiento, email, id_rol_nuevo, idUsuario]
    );

    /* ===================================================
     *         CAMBIO DE ROL — ELIMINACIÓN ORDENADA
     * =================================================== */

    if (id_rol_original !== id_rol_nuevo) {

      // 1) Buscar ids actuales
      const cliente = await client.query(
        `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
        [idUsuario]
      );

      const profesor = await client.query(
        `SELECT idprofesor FROM profesor WHERE id_usuario = $1`,
        [idUsuario]
      );

      // 2) Borrar primero relaciones HIJO → cliente_disciplina
      if (cliente.rows.length > 0) {
        const idCliente = cliente.rows[0].idcliente;
        await client.query(`DELETE FROM cliente_disciplina WHERE id_cliente = $1`, [idCliente]);
      }

      if (profesor.rows.length > 0) {
        const idProfesor = profesor.rows[0].idprofesor;
        await client.query(`DELETE FROM profesor_disciplina WHERE id_profesor = $1`, [idProfesor]);
      }

      // 3) Borrar luego tabla PADRE → cliente / profesor
      await client.query(`DELETE FROM cliente WHERE id_usuario = $1`, [idUsuario]);
      await client.query(`DELETE FROM profesor WHERE id_usuario = $1`, [idUsuario]);
    }

    /* ===================================================
     *         INSERTAR/ACTUALIZAR NUEVA ESTRUCTURA
     * =================================================== */

    /* --------- NUEVO ROL: CLIENTE --------- */
    if (id_rol_nuevo === 2) {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      let clienteRes = await client.query(
        `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
        [idUsuario]
      );

      if (clienteRes.rows.length === 0) {
        clienteRes = await client.query(
          `INSERT INTO cliente (id_usuario, id_membresia, id_disciplina)
           VALUES ($1, 1, $2)
           RETURNING idcliente`,
          [idUsuario, disciplinaPrincipal]
        );
      } else {
        await client.query(
          `UPDATE cliente SET id_disciplina = $1 WHERE id_usuario = $2`,
          [disciplinaPrincipal, idUsuario]
        );
      }

      const idCliente = clienteRes.rows[0].idcliente;

      await client.query(`DELETE FROM cliente_disciplina WHERE id_cliente = $1`, [idCliente]);

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO cliente_disciplina (id_cliente, id_disciplina)
           VALUES ($1, $2)`,
          [idCliente, idDisc]
        );
      }
    }

    /* --------- NUEVO ROL: PROFESOR --------- */
    if (id_rol_nuevo === 1) {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      let profesorRes = await client.query(
        `SELECT idprofesor FROM profesor WHERE id_usuario = $1`,
        [idUsuario]
      );

      if (profesorRes.rows.length === 0) {
        profesorRes = await client.query(
          `INSERT INTO profesor (id_usuario, id_disciplina)
           VALUES ($1, $2)
           RETURNING idprofesor`,
          [idUsuario, disciplinaPrincipal]
        );
      } else {
        await client.query(
          `UPDATE profesor SET id_disciplina = $1 WHERE id_usuario = $2`,
          [disciplinaPrincipal, idUsuario]
        );
      }

      const idProfesor = profesorRes.rows[0].idprofesor;

      await client.query(`DELETE FROM profesor_disciplina WHERE id_profesor = $1`, [idProfesor]);

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO profesor_disciplina (id_profesor, id_disciplina)
           VALUES ($1, $2)`,
          [idProfesor, idDisc]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Usuario actualizado correctamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar usuario' });
  } finally {
    client.release();
  }
});

/* =====================================================
 *                ELIMINAR USUARIO
 * ===================================================== */
router.delete('/:id', async (req, res) => {
  const idUsuario = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE usuarios SET activo = FALSE WHERE "idUsuario" = $1`,
      [idUsuario]
    );

    const cliente = await client.query(
      `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (cliente.rows.length > 0) {
      const idCliente = cliente.rows[0].idcliente;
      await client.query(`DELETE FROM cliente_disciplina WHERE id_cliente = $1`, [idCliente]);
      await client.query(`DELETE FROM cliente WHERE idcliente = $1`, [idCliente]);
    }

    const profesor = await client.query(
      `SELECT idprofesor FROM profesor WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (profesor.rows.length > 0) {
      const idProfesor = profesor.rows[0].idprofesor;
      await client.query(`DELETE FROM profesor_disciplina WHERE id_profesor = $1`, [idProfesor]);
      await client.query(`DELETE FROM profesor WHERE idprofesor = $1`, [idProfesor]);
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Usuario eliminado correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al eliminar usuario' });
  } finally {
    client.release();
  }
});

export default router;
