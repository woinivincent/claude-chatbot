// server.js (versión para producción)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para la API de Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-7-sonnet-20250219',
      messages: messages,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error al comunicarse con la API de Claude:', error.response || error);
    res.status(500).json({ 
      error: 'Error al comunicarse con la API de Claude',
      details: error.response ? error.response.data : error.message 
    });
  }
});

// Servir archivos estáticos de React en producción
if (process.env.NODE_ENV === 'production') {
  // Directorio de los archivos estáticos de la build de React
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Para cualquier otra ruta, enviar index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});