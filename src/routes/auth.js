import express from 'express';
import pool from '../db.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './emailServices.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { dni, contraseña } = req.body;

  try {
    if (!dni || !contraseña) {
      return res.status(400).json({ error: 'DNI y contraseña son requeridos' });
    }

    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({ error: 'El DNI debe tener exactamente 8 números' });
    }

    // 1️⃣ Buscar usuario SOLO por DNI
    const userResult = await pool.query(
      `SELECT * FROM usuarios WHERE dni = $1`,
      [dni]
    );

    // ❌ DNI inexistente
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    const user = userResult.rows[0];

    // 2️⃣ Contraseña incorrecta
    if (user.contraseña !== contraseña) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    // 3️⃣ Usuario deshabilitado
    if (!user.activo) {
      return res.status(403).json({
        error: 'El usuario se encuentra deshabilitado. Contacte al administrador.'
      });
    }

    // 4️⃣ Login OK
    const { contraseña: _, ...userData } = user;

    res.json({ success: true, user: userData });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor. Intente nuevamente más tarde.'
    });
  }
});


// Solicitud de recuperacion de contraseña
router.post('/solicitarRecuperacion', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: 'El email es requerido' });

    console.log('Solicitando recuperación para:', email);

    const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    // Validacion si existe el mail o no
    if (userResult.rows.length === 0) {
      console.log('Email no encontrado en BD:', email);
      return res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 600000); 

    console.log('🔑 Token generado para:', email);

    // Se guarda token en la tabla de la base de datos
    await pool.query(
      'INSERT INTO recuperacioncontrasena (emailtoken, token, expira) VALUES ($1, $2, $3)',
      [email, token, expiresAt]
    );

    // Se envía el mail
    const emailSent = await sendPasswordResetEmail(email, token);

    if (emailSent) {
      console.log('✅ Email enviado exitosamente a:', email);
      res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    } else {
      console.log('Error al enviar email a:', email);
      res.status(500).json({ error: 'Error al enviar el email de recuperación' });
    }
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar contraseña usando el token
router.post('/cambiarPassword', async (req, res) => {
  console.log('Se llamó a /cambiarPassword con body:', req.body); //log en consola para ver el flujo

  const { token, nuevaPassword } = req.body;

  try {
    if (!token || !nuevaPassword) {
      console.log('Faltan datos en la solicitud');
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    if (nuevaPassword.length < 8) {
      console.log('Contraseña demasiado corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar token válido
    const tokenResult = await pool.query(
      'SELECT * FROM recuperacioncontrasena WHERE token = $1 AND expira > NOW()',
      [token]
    );

    console.log('🔎 Resultado búsqueda token:', tokenResult.rows);

    if (tokenResult.rows.length === 0) {
      console.log('Token inválido o expirado');
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const email = tokenResult.rows[0].emailtoken;

    // Verificar que la nueva contraseña no sea la misma
    const userResult = await pool.query(
      'SELECT contraseña FROM usuarios WHERE email = $1',
      [email]
    );

    console.log('🔎 Contraseña actual en BD:', userResult.rows);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (userResult.rows[0].contraseña === nuevaPassword) {
      console.log('La nueva contraseña es igual a la anterior');
      return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la anterior' });
    }

    // Actualizar contraseña
    await pool.query(
      'UPDATE usuarios SET contraseña = $1 WHERE email = $2',
      [nuevaPassword, email]
    );

    // Borrar token
    await pool.query('DELETE FROM recuperacioncontrasena WHERE token = $1', [token]);

    console.log('Contraseña actualizada correctamente para:', email);

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en /cambiarPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
