/* ── Vercel Serverless Function for Grok AI ── */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { prompt, temperature = 0.7, num_predict = 512 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const GROK_API_KEY = process.env.GROK_API_KEY || 'your-api-key-here';
    const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

    console.log('Sending request to Grok AI:', { prompt: prompt.substring(0, 50), temperature, num_predict });

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

    console.log('Grok AI Response Status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Grok AI Error:', response.status, data);
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const responseText = data.choices?.[0]?.message?.content || '';

    console.log('Generated text:', responseText.substring(0, 50));

    return res.status(200).json({
      success: true,
      response: responseText.trim() || 'Sorry, I could not generate a response.'
    });

  } catch (error) {
    console.error('Handler Error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
