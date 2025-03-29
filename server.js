// server.js - versión simplificada
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta raíz para confirmar que el servidor responde
app.get('/', (req, res) => {
  res.send('Servidor del chatbot de Claude funcionando correctamente. Usa /api/chat para interactuar con la API.');
});

// Ruta para la API de Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Verifica si la API key está configurada
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'API key no configurada en el servidor' });
    }
    
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
