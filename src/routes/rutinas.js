import express from 'express';
import pool from '../db.js';

const router = express.Router();

/* =========================
   CREAR RUTINA (para clientes Y profesores)
========================= */
router.post('/', async (req, res) => {
  console.log('POST /api/rutinas - Nueva estructura');
  console.log('BODY:', req.body);

  const { idUsuario, idDisciplina, titulo, estiramientos, ejercicios } = req.body;

  if (!idUsuario || !idDisciplina || !titulo || !estiramientos || !ejercicios) {
    console.log('❌ Datos faltantes en POST');
    return res.status(400).json({ 
      success: false,
      error: 'Faltan datos: idUsuario, idDisciplina, titulo, estiramientos, ejercicios' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(`Buscando usuario:`, idUsuario);

    let idCliente = null;
    let idProfesor = null;
    let tipoUsuario = '';

    // 1. Intentar encontrar como CLIENTE
    const cliRes = await client.query(
      `SELECT idcliente FROM cliente WHERE id_usuario = $1`,
      [Number(idUsuario)]
    );

    if (cliRes.rowCount > 0) {
      idCliente = cliRes.rows[0].idcliente;
      tipoUsuario = 'cliente';
      console.log('✅ Usuario encontrado como CLIENTE, idCliente:', idCliente);
      
    } else {
      // 2. Si no es cliente, buscar como PROFESOR
      const profRes = await client.query(
        `SELECT idprofesor FROM profesor WHERE id_usuario = $1`,
        [Number(idUsuario)]
      );

      if (profRes.rowCount > 0) {
        idProfesor = profRes.rows[0].idprofesor;
        tipoUsuario = 'profesor';
        console.log('✅ Usuario encontrado como PROFESOR, idProfesor:', idProfesor);
        
      } else {
        throw new Error('El usuario no está registrado como cliente ni como profesor');
      }
    }

    // 3. Crear detalle de rutina
    const detRes = await client.query(
      `INSERT INTO detallerutina (estiramiento, ejercicio)
       VALUES ($1, $2)
       RETURNING iddetallerutina`,
      [estiramientos, ejercicios]
    );

    const idDetalle = detRes.rows[0].iddetallerutina;
    console.log('✅ idDetalle creado:', idDetalle);

    // 4. Crear rutina según el tipo de usuario
    const rutRes = await client.query(
      `INSERT INTO rutina 
       (nombrerutina, id_detallerutina, id_cliente, id_profesor, id_disciplina, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING idrutina`,
      [
        titulo, 
        idDetalle, 
        idCliente,  // será NULL para profesores
        idProfesor, // será NULL para clientes
        Number(idDisciplina)
      ]
    );

    await client.query('COMMIT');

    console.log('✅ Rutina creada exitosamente. ID:', rutRes.rows[0].idrutina, 'Tipo:', tipoUsuario);

    res.json({
      success: true,
      message: `Rutina creada para ${tipoUsuario}`,
      idRutina: rutRes.rows[0].idrutina,
      tipoUsuario: tipoUsuario
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error POST rutina:', err.message);
    
    res.status(500).json({ 
      success: false,
      error: err.message || 'Error al guardar la rutina'
    });
  } finally {
    client.release();
  }
});

/* =========================
   OBTENER RUTINAS POR CLIENTE Y DISCIPLINA
========================= */
router.get('/cliente/:idUsuario/disciplina/:idDisciplina', async (req, res) => {
  const { idUsuario, idDisciplina } = req.params;

  console.log('GET rutinas por usuario + disciplina');
  console.log('PARAMS:', req.params);

  if (isNaN(idUsuario) || isNaN(idDisciplina)) {
    console.log('❌ Parámetros inválidos');
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    const result = await pool.query(
      `SELECT r.idrutina, r.nombrerutina
       FROM rutina r
       LEFT JOIN cliente c ON r.id_cliente = c.idcliente
       LEFT JOIN profesor p ON r.id_profesor = p.idprofesor
       WHERE (c.id_usuario = $1 OR p.id_usuario = $1)
         AND r.id_disciplina = $2
         AND r.activo = true`,
      [Number(idUsuario), Number(idDisciplina)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error rutinas por disciplina:', err);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

/* =========================
   OBTENER DETALLE DE RUTINA
========================= */
router.get('/detalle/:idRutina', async (req, res) => {
  const { idRutina } = req.params;

  console.log('GET detalle rutina');
  console.log('PARAMS:', req.params);

  if (isNaN(idRutina)) {
    console.log('❌ idRutina inválido');
    return res.status(400).json({ error: 'idRutina inválido' });
  }

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
      [Number(idRutina)]
    );

    if (detail.rowCount === 0) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json(detail.rows[0]);
  } catch (err) {
    console.error('❌ Error detalle rutina:', err);
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
});

/* =========================
   OBTENER RUTINAS ACTIVAS DEL USUARIO (cliente o profesor)
========================= */
router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  if (isNaN(idUsuario)) {
    return res.status(400).json({ error: 'idUsuario inválido' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         r.idrutina,
         r.nombrerutina,
         d.iddisciplina,
         d.nombredisciplina,
         CASE 
           WHEN r.id_cliente IS NOT NULL THEN 'cliente'
           WHEN r.id_profesor IS NOT NULL THEN 'profesor'
         END as tipo_usuario
       FROM rutina r
       LEFT JOIN cliente c ON r.id_cliente = c.idcliente
       LEFT JOIN profesor p ON r.id_profesor = p.idprofesor
       JOIN disciplina d ON r.id_disciplina = d.iddisciplina
       WHERE (c.id_usuario = $1 OR p.id_usuario = $1)
         AND r.activo = true`,
      [Number(idUsuario)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error rutinas usuario:', err);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
});

/* =========================
   MODIFICAR RUTINA
========================= */
router.put('/:idRutina', async (req, res) => {
  const { idRutina } = req.params;
  const { titulo, estiramientos, ejercicios, idDisciplina } = req.body;

  console.log('PUT rutina');
  console.log('PARAMS:', req.params);
  console.log('BODY:', req.body);

  if (
    isNaN(idRutina) ||
    isNaN(idDisciplina) ||
    !titulo?.trim() ||
    !estiramientos ||
    !ejercicios
  ) {
    console.log('❌ Datos inválidos en PUT');
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rut = await client.query(
      `SELECT id_detallerutina
       FROM rutina
       WHERE idrutina = $1 AND activo = true`,
      [Number(idRutina)]
    );

    if (rut.rowCount === 0) {
      throw new Error('Rutina no encontrada');
    }

    const idDetalle = rut.rows[0].id_detallerutina;

    await client.query(
      `UPDATE rutina
       SET nombrerutina = $1,
           id_disciplina = $2
       WHERE idrutina = $3`,
      [titulo, Number(idDisciplina), Number(idRutina)]
    );

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
    console.error('❌ Error PUT rutina:', err);
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

  console.log('DELETE rutina');
  console.log('PARAMS:', req.params);

  if (isNaN(idRutina)) {
    return res.status(400).json({ error: 'idRutina inválido' });
  }

  try {
    const result = await pool.query(
      `UPDATE rutina SET activo = false WHERE idrutina = $1`,
      [Number(idRutina)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json({ message: 'Rutina eliminada (borrado lógico)' });
  } catch (err) {
    console.error('❌ Error DELETE rutina:', err);
    res.status(500).json({ error: 'Error al eliminar la rutina' });
  }
});

export default router;