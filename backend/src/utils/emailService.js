const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const enviarEmailConfirmacao = async (email, username, token) => {
  const url = `${process.env.FRONTEND_URL}/confirmar-email/${token}`
  await transporter.sendMail({
    from: `"FunnyApp 😂" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirme seu email — FunnyApp',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#FFD600;font-size:1.5rem;margin-bottom:8px">😂 FunnyApp</h1>
        <h2 style="font-size:1.1rem;margin-bottom:16px">Olá, @${username}!</h2>
        <p style="color:#ccc;margin-bottom:24px">Clique no botão abaixo para confirmar seu email e ativar sua conta.</p>
        <a href="${url}" style="display:inline-block;background:#FFD600;color:#000;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:1rem">
          Confirmar email
        </a>
        <p style="color:#888;font-size:0.8rem;margin-top:24px">Este link expira em 24 horas. Se não foi você, ignore este email.</p>
      </div>
    `
  })
}

const enviarEmailRecuperacao = async (email, username, token) => {
  const url = `${process.env.FRONTEND_URL}/redefinir-senha/${token}`
  await transporter.sendMail({
    from: `"FunnyApp 😂" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Redefinir senha — FunnyApp',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#FFD600;font-size:1.5rem;margin-bottom:8px">😂 FunnyApp</h1>
        <h2 style="font-size:1.1rem;margin-bottom:16px">Olá, @${username}!</h2>
        <p style="color:#ccc;margin-bottom:24px">Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha.</p>
        <a href="${url}" style="display:inline-block;background:#FFD600;color:#000;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:1rem">
          Redefinir senha
        </a>
        <p style="color:#888;font-size:0.8rem;margin-top:24px">Este link expira em 1 hora. Se não foi você, ignore este email.</p>
      </div>
    `
  })
}

module.exports = { enviarEmailConfirmacao, enviarEmailRecuperacao }
