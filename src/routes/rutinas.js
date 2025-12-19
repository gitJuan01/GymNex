import express from 'express';
import pool from '../db.js';

const router = express.Router();

/* =========================
   CREAR RUTINA
========================= */
router.post('/', async (req, res) => {
  const { idUsuario, idDisciplina, titulo, estiramientos, ejercicios } = req.body;

  if (!idUsuario || !idDisciplina || !titulo || !estiramientos || !ejercicios) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cliRes = await client.query(
      `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
      [idUsuario]
    );

    if (cliRes.rowCount === 0) {
      throw new Error('El usuario no está registrado como cliente');
    }

    const idCliente = cliRes.rows[0].idcliente;

    const detRes = await client.query(
      `INSERT INTO detallerutina (estiramiento, ejercicio)
       VALUES ($1, $2)
       RETURNING iddetallerutina`,
      [estiramientos, ejercicios]
    );

    const idDetalle = detRes.rows[0].iddetallerutina;

    const rutRes = await client.query(
      `INSERT INTO rutina 
       (nombrerutina, id_detallerutina, id_cliente, id_disciplina, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING idrutina`,
      [titulo, idDetalle, idCliente, idDisciplina]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Rutina guardada correctamente',
      idRutina: rutRes.rows[0].idrutina
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la rutina' });
  } finally {
    client.release();
  }
});

/* =========================
   RUTINAS POR CLIENTE Y DISCIPLINA
   (VA ANTES DE /:idUsuario)
========================= */
router.get('/cliente/:idUsuario/disciplina/:idDisciplina', async (req, res) => {
  const { idUsuario, idDisciplina } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.idrutina, r.nombrerutina
       FROM rutina r
       JOIN cliente c ON r.id_cliente = c.idcliente
       WHERE c.id_usuario = $1
         AND r.id_disciplina = $2
         AND r.activo = true`,
      [idUsuario, idDisciplina]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

/* =========================
   OBTENER RUTINAS ACTIVAS DEL CLIENTE
========================= */
router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.idrutina, r.nombrerutina
       FROM rutina r
       JOIN cliente c ON r.id_cliente = c.idcliente
       WHERE c.id_usuario = $1
         AND r.activo = true`,
      [idUsuario]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

/* =========================
   OBTENER DETALLE DE RUTINA
========================= */
router.get('/detalle/:idRutina', async (req, res) => {
  const { idRutina } = req.params;

  try {
    const detail = await pool.query(
      `SELECT 
         r.nombrerutina,
         r.id_disciplina,
         d.estiramiento,
         d.ejercicio
       FROM rutina r
       JOIN detallerutina d ON r.id_detallerutina = d.iddetallerutina
       WHERE r.idrutina = $1
         AND r.activo = true`,
      [idRutina]
    );

    if (detail.rowCount === 0) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json(detail.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
});


/* =========================
   MODIFICAR RUTINA
========================= */
router.put('/:idRutina', async (req, res) => {
  const { idRutina } = req.params;
  const { titulo, estiramientos, ejercicios, idDisciplina } = req.body;

  if (!idDisciplina || !titulo || !titulo.trim() || !estiramientos || !ejercicios) {
  return res.status(400).json({ error: 'Faltan datos obligatorios' });
}

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rut = await client.query(
      `SELECT id_detallerutina
       FROM rutina
       WHERE idrutina = $1 AND activo = true`,
      [idRutina]
    );

    if (rut.rowCount === 0) {
      throw new Error('Rutina no encontrada');
    }

    const idDetalle = rut.rows[0].id_detallerutina;

    // 🔹 Actualiza rutina + disciplina
    await client.query(
      `UPDATE rutina
       SET nombrerutina = $1,
           id_disciplina = $2
       WHERE idrutina = $3`,
      [titulo, idDisciplina, idRutina]
    );

    // 🔹 Actualiza detalle
    await client.query(
      `UPDATE detallerutina
       SET estiramiento = $1,
           ejercicio = $2
       WHERE iddetallerutina = $3`,
      [estiramientos, ejercicios, idDetalle]
    );

    await client.query('COMMIT');
    res.json({ message: 'Rutina actualizada correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la rutina' });
  } finally {
    client.release();
  }
});


/* =========================
   BORRADO LÓGICO
========================= */
router.delete('/:idRutina', async (req, res) => {
  const { idRutina } = req.params;

  try {
    const result = await pool.query(
      `UPDATE rutina SET activo = false WHERE idrutina = $1`,
      [idRutina]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json({ message: 'Rutina eliminada (borrado lógico)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la rutina' });
  }
});

export default router;
