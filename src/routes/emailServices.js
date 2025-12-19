import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Gmail usa STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// (opcional pero recomendado)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con SMTP:', error);
  } else {
    console.log('✅ Servidor SMTP listo para enviar emails');
  }
});

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/cambio-contrasena?token=${token}`;

  const mailOptions = {
    from: `"GymNex" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperación de Contraseña - GymNex',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Recuperación de Contraseña</h2>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #007bff;
                  color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
          Restablecer Contraseña
        </a>
        <p><strong>El enlace expirará en 15 minutos.</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};
