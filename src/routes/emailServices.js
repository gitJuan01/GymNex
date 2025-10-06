import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',       
  auth: {
    user: 'jc.acunaluzzi@gmail.com',  
    pass: 'jerlnftoqccbgvoj' 
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
    console.log('Email enviado a:', email);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};