const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: "Campos 'to', 'subject' e 'body' são obrigatórios!",
    });
  }

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to,
    subject,
    text: body,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
        <h3 style="color: #333; text-align: center; margin-bottom: 20px;">${subject}</h3>
        <p>${body}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Iniciar servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
