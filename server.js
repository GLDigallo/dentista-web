require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const siteData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'site.json'), 'utf8'));

app.use(express.json());

// Selector principal
app.use(express.static(path.join(__dirname, 'public')));

// Modelos - cada uno sirve sus archivos estáticos
app.use('/modelo-a', express.static(path.join(__dirname, 'modelo-a')));
app.use('/modelo-b', express.static(path.join(__dirname, 'modelo-b')));
app.use('/modelo-c', express.static(path.join(__dirname, 'modelo-c')));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get('/api/site', (req, res) => {
  res.json(siteData);
});

app.post('/api/contacto', async (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos.' });
  }

  const htmlContent = `
    <h2>Nuevo mensaje desde la web</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
    <p><strong>Asunto:</strong> ${asunto || 'Consulta general'}</p>
    <hr>
    <p><strong>Mensaje:</strong></p>
    <p>${mensaje.replace(/\n/g, '<br>')}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Web - ${siteData.dentista.nombre}" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO || process.env.SMTP_USER,
      replyTo: email,
      subject: `[Web] ${asunto || 'Nueva consulta'} - ${nombre}`,
      html: htmlContent
    });
    res.json({ success: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje. Intentá nuevamente o contactanos por WhatsApp.' });
  }
});

// Para cada modelo, servir index.html en la raíz del modelo
['modelo-a', 'modelo-b', 'modelo-c'].forEach(modelo => {
  app.get(`/${modelo}/`, (req, res) => {
    res.sendFile(path.join(__dirname, modelo, 'index.html'));
  });
  app.get(`/${modelo}/:page`, (req, res) => {
    const file = req.params.page.endsWith('.html') ? req.params.page : req.params.page + '.html';
    const filePath = path.join(__dirname, modelo, file);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.redirect(`/${modelo}/`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Selector: http://localhost:${PORT}/`);
  console.log(`Modelo A: http://localhost:${PORT}/modelo-a/`);
  console.log(`Modelo B: http://localhost:${PORT}/modelo-b/`);
  console.log(`Modelo C: http://localhost:${PORT}/modelo-c/`);
});
