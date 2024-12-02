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

// Função para formatar data e hora no fuso horário correto
function formatDateTime() {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

// Função para extrair informações do formato MATMSG
function parseQRCodeData(qrData) {
  const match = qrData.match(/^MATMSG:TO:(.+);SUB:(.+);BODY:(.+);;$/);
  if (!match) {
    throw new Error("Formato inválido de QR Code!");
  }
  return {
    email: match[1],
    subject: match[2],
    location: match[3],
  };
}

// Endpoint para envio de e-mail
app.post("/send-email", async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ success: false, message: "Dados do QR Code são obrigatórios!" });
  }

  try {
    const { email, subject, location } = parseQRCodeData(qrData);
    const dateTime = formatDateTime(); // Capturar a data e hora no momento do envio

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: subject, // Assunto vindo do QR Code
      text: `Olá,

A visita técnica foi realizada com sucesso.

Data e Hora: ${dateTime}
Local: ${location}

Atenciosamente,
Equipe Técnica`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h3 style="color: #333; text-align: center; margin-bottom: 20px;">Confirmação de Visita Técnica</h3>
          <p>Olá,</p>
          <p>A visita técnica foi realizada com sucesso.</p>
          <p><strong>Data e Hora:</strong> ${dateTime}</p>
          <p><strong>Local:</strong> ${location}</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Técnica</strong></p>
        </div>
      `,
    };

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
