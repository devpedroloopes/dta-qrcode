const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

// Carregando as variáveis de ambiente
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do transporter do Nodemailer usando as variáveis de ambiente
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL, // Usando a variável de ambiente para o e-mail
    pass: process.env.EMAIL_PASSWORD, // Usando a variável de ambiente para a senha de aplicativo
  },
});

// Endpoint para envio de e-mail
app.post("/send-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-mail é obrigatório!" });
  }

  const mailOptions = {
    from: process.env.USER_EMAIL, // Usando a variável de ambiente para o e-mail
    to: email,
    subject: "Aviso de Visita Técnica",
    text: "O técnico realizou a visita no local.",
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
