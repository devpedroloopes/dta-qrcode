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

// Endpoint para envio de e-mail
app.post("/send-email", async (req, res) => {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: "E-mail, assunto e local são obrigatórios!",
    });
  }

  const dateTime = formatDateTime(); // Capturar a data e hora no momento do envio
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: subject,
    text: `Olá,

${body}

Data e Hora: ${dateTime}

Atenciosamente,
Equipe Técnica`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
        <h3 style="color: #333; text-align: center; margin-bottom: 20px;">${subject}</h3>
        <p>Olá,</p>
        <p>${body}</p>
        <p><strong>Data e Hora:</strong> ${dateTime}</p>
        <p>Atenciosamente,</p>
        <p><strong>Equipe Técnica</strong></p>
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
