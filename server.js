require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const siteData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'site.json'), 'utf8'));

app.use(express.json());

// Selector principal (raíz)
app.use(express.static(path.join(__dirname, 'public')));

// Los 3 modelos como archivos estáticos
app.use('/modelo-a', express.static(path.join(__dirname, 'modelo-a')));
app.use('/modelo-b', express.static(path.join(__dirname, 'modelo-b')));
app.use('/modelo-c', express.static(path.join(__dirname, 'modelo-c')));

// API
app.get('/api/site', (req, res) => res.json(siteData));

// Email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/contacto', async (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos.' });
  }
  try {
    await transporter.sendMail({
      from: `"Web - ${siteData.dentista.nombre}" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO || process.env.SMTP_USER,
      replyTo: email,
      subject: `[Web] ${asunto || 'Nueva consulta'} - ${nombre}`,
      html: `<h2>Nuevo mensaje</h2><p><b>Nombre:</b> ${nombre}</p><p><b>Email:</b> ${email}</p><p><b>Tel:</b> ${telefono || '-'}</p><p><b>Asunto:</b> ${asunto || '-'}</p><hr><p>${mensaje.replace(/\n/g, '<br>')}</p>`
    });
    res.json({ success: true, message: 'Mensaje enviado.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Error al enviar. Intentá por WhatsApp.' });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
