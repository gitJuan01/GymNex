// routes/clienteEstado.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

/* =====================================================
 * OBTENER ESTADO DE DEUDOR DEL CLIENTE
 * ===================================================== */
router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  console.log('🔍 Solicitando estado de cliente para idUsuario:', idUsuario);

  try {
    // Primero verifiquemos que el parámetro sea un número
    const idUsuarioNum = parseInt(idUsuario);
    if (isNaN(idUsuarioNum)) {
      console.log('❌ ID de usuario no válido:', idUsuario);
      return res.status(400).json({ 
        success: false, 
        error: 'ID de usuario no válido' 
      });
    }

    const result = await pool.query(`
      SELECT 
        em.deudor,
        em.idmembresia
      FROM cliente c
      JOIN estadomembresia em ON c.id_membresia = em.idmembresia
      WHERE c.id_usuario = $1
        AND c.activo = TRUE
    `, [idUsuarioNum]);

    console.log('📊 Resultado de la consulta:', result.rows);

    if (result.rows.length === 0) {
      console.log('⚠️ Cliente no encontrado para idUsuario:', idUsuarioNum);
      return res.status(404).json({ 
        success: false, 
        error: 'Cliente no encontrado o inactivo' 
      });
    }

    const estado = result.rows[0];
    console.log('✅ Estado encontrado:', estado);
    
    res.json({
      success: true,
      deudor: estado.deudor,
      idMembresia: estado.idmembresia,
      mensaje: estado.deudor ? 'Sí adeuda cuota' : 'No adeuda cuota'
    });

  } catch (error) {
    console.error('❌ Error al obtener estado de cliente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al obtener estado del cliente' 
    });
  }
});

export default router;