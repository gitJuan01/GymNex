import express from 'express';
import pool from '../db.js';

const router = express.Router();

const rolesMap = {
  cliente: 2,
  profesor: 1,
  administrador: 3
};

// Función para validar DNI (8 dígitos exactos)
const validarDNI = (dni) => {
  const dniStr = dni.toString();
  // Verificar que sea exactamente 8 dígitos
  return /^\d{8}$/.test(dniStr);
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

  // 🔴 VALIDACIÓN DE DNI (8 DÍGITOS EXACTOS)
  if (!validarDNI(dni)) {
    return res.status(400).json({ 
      error: 'El DNI debe contener exactamente 8 dígitos numéricos' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 🔑 Solo validar contra usuarios activos
    const dniExistente = await client.query(
      `SELECT "idUsuario" FROM usuarios WHERE dni = $1 AND activo = TRUE`,
      [dni]
    );

    if (dniExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    const id_rol = rolesMap[rol];
    if (!id_rol) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const usuarioRes = await client.query(
      `INSERT INTO usuarios
       (nombre, apellido, dni, fecha_de_nacimiento, contraseña, id_rol, email, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7, TRUE)
       RETURNING "idUsuario"`,
      [nombre, apellido, dni, fecha_de_nacimiento, dni, id_rol, email]
    );

    const idUsuario = usuarioRes.rows[0].idUsuario;

    /* ---------- CLIENTE ---------- */
    if (rol === 'cliente') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const clienteRes = await client.query(
        `INSERT INTO cliente (id_usuario, id_membresia, id_disciplina, activo)
         VALUES ($1, 1, $2, TRUE)
         RETURNING idcliente`,
        [idUsuario, disciplinaPrincipal]
      );

      const idCliente = clienteRes.rows[0].idcliente;

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO cliente_disciplina (id_cliente, id_disciplina)
           VALUES ($1,$2)`,
          [idCliente, idDisc]
        );
      }
    }

    /* ---------- PROFESOR ---------- */
    if (rol === 'profesor') {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      const profesorRes = await client.query(
        `INSERT INTO profesor (id_usuario, id_disciplina, activo)
         VALUES ($1,$2, TRUE)
         RETURNING idprofesor`,
        [idUsuario, disciplinaPrincipal]
      );

      const idProfesor = profesorRes.rows[0].idprofesor;

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO profesor_disciplina (id_profesor, id_disciplina)
           VALUES ($1,$2)`,
          [idProfesor, idDisc]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Usuario creado correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al crear usuario' });
  } finally {
    client.release();
  }
});

/* =====================================================
 *                ACTUALIZAR USUARIO
 * ===================================================== */
router.put('/:id', async (req, res) => {
  const idUsuario = req.params.id;
  const { nombre, apellido, dni, fecha_de_nacimiento, email, rol, disciplinasIds = [] } = req.body;

  // 🔴 VALIDACIÓN DE DNI (8 DÍGITOS EXACTOS) - TAMBIÉN EN ACTUALIZACIÓN
  if (!validarDNI(dni)) {
    return res.status(400).json({ 
      error: 'El DNI debe contener exactamente 8 dígitos numéricos' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const id_rol_nuevo = rolesMap[rol];
    if (!id_rol_nuevo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Rol no válido' });
    }

    // 🔴 Verificar que el DNI no esté siendo usado por otro usuario activo
    const dniDuplicado = await client.query(
      `SELECT "idUsuario" FROM usuarios 
       WHERE dni = $1 AND activo = TRUE AND "idUsuario" != $2`,
      [dni, idUsuario]
    );

    if (dniDuplicado.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El DNI ya está registrado por otro usuario' });
    }

    const rolOriginal = await client.query(
      `SELECT id_rol FROM usuarios WHERE "idUsuario" = $1`,
      [idUsuario]
    );

    if (rolOriginal.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_rol_original = rolOriginal.rows[0].id_rol;

    await client.query(
      `UPDATE usuarios
       SET nombre=$1, apellido=$2, dni=$3, fecha_de_nacimiento=$4, email=$5, id_rol=$6
       WHERE "idUsuario"=$7`,
      [nombre, apellido, dni, fecha_de_nacimiento, email, id_rol_nuevo, idUsuario]
    );

    /* 🔑 Desactivar solo si cambia el rol */
    if (id_rol_original !== id_rol_nuevo) {
      await client.query(`UPDATE cliente SET activo = FALSE WHERE id_usuario = $1`, [idUsuario]);
      await client.query(`UPDATE profesor SET activo = FALSE WHERE id_usuario = $1`, [idUsuario]);
    }

    /* --------- CLIENTE --------- */
    if (id_rol_nuevo === 2) {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      let clienteRes = await client.query(
        `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
        [idUsuario]
      );

      let idCliente;

      if (clienteRes.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO cliente (id_usuario, id_membresia, id_disciplina, activo)
           VALUES ($1,1,$2,TRUE)
           RETURNING idcliente`,
          [idUsuario, disciplinaPrincipal]
        );
        idCliente = insert.rows[0].idcliente;
      } else {
        idCliente = clienteRes.rows[0].idcliente;
        await client.query(
          `UPDATE cliente SET id_disciplina=$1, activo=TRUE WHERE idcliente=$2`,
          [disciplinaPrincipal, idCliente]
        );
      }

      await client.query(`DELETE FROM cliente_disciplina WHERE id_cliente=$1`, [idCliente]);

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO cliente_disciplina (id_cliente,id_disciplina)
           VALUES ($1,$2)`,
          [idCliente, idDisc]
        );
      }
    }

    /* --------- PROFESOR --------- */
    if (id_rol_nuevo === 1) {
      const disciplinaPrincipal = disciplinasIds[0] || null;

      let profesorRes = await client.query(
        `SELECT idprofesor FROM profesor WHERE id_usuario = $1`,
        [idUsuario]
      );

      let idProfesor;

      if (profesorRes.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO profesor (id_usuario, id_disciplina, activo)
           VALUES ($1,$2,TRUE)
           RETURNING idprofesor`,
          [idUsuario, disciplinaPrincipal]
        );
        idProfesor = insert.rows[0].idprofesor;
      } else {
        idProfesor = profesorRes.rows[0].idprofesor;
        await client.query(
          `UPDATE profesor SET id_disciplina=$1, activo=TRUE WHERE idprofesor=$2`,
          [disciplinaPrincipal, idProfesor]
        );
      }

      await client.query(`DELETE FROM profesor_disciplina WHERE id_profesor=$1`, [idProfesor]);

      for (const idDisc of disciplinasIds) {
        await client.query(
          `INSERT INTO profesor_disciplina (id_profesor,id_disciplina)
           VALUES ($1,$2)`,
          [idProfesor, idDisc]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Usuario actualizado correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al actualizar usuario' });
  } finally {
    client.release();
  }
});

/* =====================================================
 *                ELIMINAR USUARIO (LÓGICO)
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

    await client.query(
      `UPDATE cliente SET activo = FALSE WHERE id_usuario = $1`,
      [idUsuario]
    );

    await client.query(
      `UPDATE profesor SET activo = FALSE WHERE id_usuario = $1`,
      [idUsuario]
    );

    await client.query(
      `UPDATE rutina
       SET activo = FALSE
       WHERE id_cliente IN (
         SELECT idcliente FROM cliente WHERE id_usuario = $1
       )`,
      [idUsuario]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Usuario deshabilitado correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno al eliminar usuario' });
  } finally {
    client.release();
  }
});

export default router;