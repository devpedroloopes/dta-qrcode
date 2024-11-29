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

// Função para formatar data e hora
function formatDateTime() {
  const now = new Date();
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return now.toLocaleDateString("pt-BR", options);
}

// Endpoint para envio de e-mail
app.post("/send-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-mail é obrigatório!" });
  }

  const dateTime = formatDateTime(); // Capturar a data e hora no momento do envio
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Aviso de Visita Técnica",
    text: `Olá,

O técnico realizou a visita no local.

Detalhes da visita:
- Data e Hora do Escaneamento: ${dateTime}

Atenciosamente,
Equipe Técnica`,
    html: `<p>Olá,</p>
      <p>O técnico realizou a visita no local.</p>
      <p><strong>Detalhes da visita:</strong></p>
      <ul>
        <li><strong>Data e Hora do Escaneamento:</strong> ${dateTime}</li>
      </ul>
      <p>Atenciosamente,</p>
      <p>Equipe Técnica</p>`,
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
