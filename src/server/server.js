const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "seu-email@gmail.com",
    pass: "sua-senha",
  },
});

function formatDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

app.post("/send-email", async (req, res) => {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: "Dados incompletos! Certifique-se de incluir e-mail, assunto e local.",
    });
  }

  const dateTime = formatDateTime();

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: subject,
    text: `Olá,

A visita técnica foi realizada com sucesso.

Data e Hora: ${dateTime}
Local: ${body}

Atenciosamente,
Equipe Técnica`,
    html: `
      <div>
        <h3>Confirmação de Visita Técnica</h3>
        <p>Olá,</p>
        <p>A visita técnica foi realizada com sucesso.</p>
        <p><strong>Data e Hora:</strong> ${dateTime}</p>
        <p><strong>Local:</strong> ${body}</p>
        <p>Atenciosamente,</p>
        <p>Equipe Técnica</p>
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
