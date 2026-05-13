/* ── Local Proxy Server for Grok AI ────────────────────────── */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GROK_API_KEY = process.env.GROK_API_KEY || 'your-api-key-here';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, temperature = 0.7, num_predict = 512 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Sending to Grok AI:', { prompt: prompt.substring(0, 50), temperature, num_predict });

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: num_predict,
        temperature: temperature
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Grok AI Error:', response.status, data);
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const responseText = data.choices?.[0]?.message?.content || '';

    console.log('Response:', responseText.substring(0, 50));

    res.json({
      success: true,
      response: responseText.trim() || 'No response generated'
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Grok AI Proxy running on http://localhost:${PORT}`);
});
