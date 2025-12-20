// routes/metricas.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Usuarios totales (activos + inactivos)
router.get('/usuarios-totales', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM usuarios'
    );

    res.json({
      success: true,
      total: Number(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error usuarios-totales:', error);
    res.status(500).json({ error: 'Error al obtener usuarios totales' });
  }
});

/* =====================================================
 * CLIENTES ACTIVOS - CON TODAS LAS DISCIPLINAS
 * ===================================================== */
router.get('/clientes-activos', async (req, res) => {
  try {
    // Primero obtenemos los clientes activos
    const clientesRes = await pool.query(`
      SELECT 
        c.idcliente,
        u.nombre,
        u.apellido,
        u."idUsuario"
      FROM cliente c
      JOIN usuarios u ON u."idUsuario" = c.id_usuario
      WHERE c.activo = TRUE
        AND u.activo = TRUE
      ORDER BY u.apellido, u.nombre
    `);

    // Luego obtenemos todas las disciplinas de cada cliente
    const clientesConDisciplinas = await Promise.all(
      clientesRes.rows.map(async (cliente) => {
        const disciplinasRes = await pool.query(`
          SELECT 
            d.nombredisciplina
          FROM cliente_disciplina cd
          JOIN disciplina d ON cd.id_disciplina = d.iddisciplina
          WHERE cd.id_cliente = $1
          ORDER BY d.nombredisciplina
        `, [cliente.idcliente]);

        return {
          ...cliente,
          disciplinas: disciplinasRes.rows.map(d => d.nombredisciplina)
        };
      })
    );

    res.json({
      success: true,
      total: clientesConDisciplinas.length,
      clientes: clientesConDisciplinas
    });

  } catch (error) {
    console.error('Error clientes activos:', error);
    res.status(500).json({ error: 'Error al obtener clientes activos' });
  }
});

/* =====================================================
 * CLIENTES MOROSOS - SOLO NOMBRE, APELLIDO Y DNI
 * ===================================================== */
router.get('/clientes-morosos', async (req, res) => {
  try {
    // Obtenemos solo los datos básicos de clientes morosos
    const result = await pool.query(`
      SELECT 
        u.nombre,
        u.apellido,
        u.dni,
        em.deudor
      FROM cliente c
      JOIN usuarios u ON u."idUsuario" = c.id_usuario
      JOIN estadomembresia em ON c.id_membresia = em.idmembresia
      WHERE c.activo = TRUE
        AND u.activo = TRUE
        AND em.deudor = TRUE
      ORDER BY u.apellido, u.nombre
    `);

    res.json({
      success: true,
      total: result.rows.length,
      clientes: result.rows  // Solo nombre, apellido, dni
    });

  } catch (error) {
    console.error('Error clientes morosos:', error);
    res.status(500).json({ error: 'Error al obtener clientes morosos' });
  }
});

/* =====================================================
 * PROFESORES ACTIVOS - CON TODAS LAS DISCIPLINAS
 * ===================================================== */
router.get('/profesores-activos', async (req, res) => {
  try {
    // Primero obtenemos los profesores activos
    const profesoresRes = await pool.query(`
      SELECT 
        p.idprofesor,
        u.nombre,
        u.apellido,
        u."idUsuario"
      FROM profesor p
      JOIN usuarios u ON u."idUsuario" = p.id_usuario
      WHERE p.activo = TRUE
        AND u.activo = TRUE
      ORDER BY u.apellido, u.nombre
    `);

    // Luego obtenemos todas las disciplinas de cada profesor
    const profesoresConDisciplinas = await Promise.all(
      profesoresRes.rows.map(async (profesor) => {
        const disciplinasRes = await pool.query(`
          SELECT 
            d.nombredisciplina
          FROM profesor_disciplina pd
          JOIN disciplina d ON pd.id_disciplina = d.iddisciplina
          WHERE pd.id_profesor = $1
          ORDER BY d.nombredisciplina
        `, [profesor.idprofesor]);

        return {
          ...profesor,
          disciplinas: disciplinasRes.rows.map(d => d.nombredisciplina)
        };
      })
    );

    res.json({
      success: true,
      total: profesoresConDisciplinas.length,
      profesores: profesoresConDisciplinas
    });

  } catch (error) {
    console.error('Error profesores activos:', error);
    res.status(500).json({ error: 'Error al obtener profesores activos' });
  }
});

/* =====================================================
 * RUTINAS TOTALES ACTIVAS (SOLO CONTEO)
 * ===================================================== */
router.get('/rutinas-totales', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as total
      FROM rutina 
      WHERE activo = TRUE
    `);

    res.json({
      success: true,
      total: Number(result.rows[0].total)
    });

  } catch (error) {
    console.error('Error rutinas totales:', error);
    res.status(500).json({ error: 'Error al obtener rutinas totales' });
  }
});

/* =====================================================
 * RUTINAS DE MUSCULACIÓN (SOLO CONTEO)
 * ===================================================== */
router.get('/rutinas-musculacion', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as total
      FROM rutina r
      JOIN disciplina d ON r.id_disciplina = d.iddisciplina
      WHERE r.activo = TRUE
        AND d.nombredisciplina = 'Musculación'
    `);

    res.json({
      success: true,
      total: Number(result.rows[0].total)
    });

  } catch (error) {
    console.error('Error rutinas musculación:', error);
    res.status(500).json({ error: 'Error al obtener rutinas de musculación' });
  }
});

/* =====================================================
 * RUTINAS DE FÚTBOL (SOLO CONTEO)
 * ===================================================== */
router.get('/rutinas-futbol', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as total
      FROM rutina r
      JOIN disciplina d ON r.id_disciplina = d.iddisciplina
      WHERE r.activo = TRUE
        AND d.nombredisciplina = 'Fútbol'
    `);

    res.json({
      success: true,
      total: Number(result.rows[0].total)
    });

  } catch (error) {
    console.error('Error rutinas fútbol:', error);
    res.status(500).json({ error: 'Error al obtener rutinas de fútbol' });
  }
});

/* =====================================================
 * RUTINAS DE SPINNING Y PILATES (SOLO CONTEO)
 * ===================================================== */
router.get('/rutinas-spinning', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as total
      FROM rutina r
      JOIN disciplina d ON r.id_disciplina = d.iddisciplina
      WHERE r.activo = TRUE
        AND d.nombredisciplina = 'Spinning y Pilates'
    `);

    res.json({
      success: true,
      total: Number(result.rows[0].total)
    });

  } catch (error) {
    console.error('Error rutinas spinning:', error);
    res.status(500).json({ error: 'Error al obtener rutinas de spinning y pilates' });
  }
});

export default router;