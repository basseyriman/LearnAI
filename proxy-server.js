// Serves the app and proxies OpenAI calls using OPENAI_API_KEY from .env (never exposed to the browser).

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

function openaiNotConfigured(res) {
    return res.status(503).json({
        error: 'OpenAI is not configured on this server. Set OPENAI_API_KEY in a .env file and restart (see .env.example).'
    });
}

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'LearnAI server is running' });
});

app.get('/api/openai/status', (req, res) => {
    res.json({ configured: Boolean(OPENAI_KEY && OPENAI_KEY.trim()) });
});

app.post('/api/openai/chat', async (req, res) => {
    if (!OPENAI_KEY) return openaiNotConfigured(res);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const text = await response.text();
        res.status(response.status).type('application/json').send(text);
    } catch (error) {
        console.error('OpenAI chat proxy error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.post('/api/openai/audio/speech', async (req, res) => {
    if (!OPENAI_KEY) return openaiNotConfigured(res);
    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).type('application/json').send(errText);
        }
        const buffer = await response.buffer();
        const ct = response.headers.get('content-type') || 'audio/mpeg';
        res.set('Content-Type', ct);
        res.send(buffer);
    } catch (error) {
        console.error('OpenAI speech proxy error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.post('/api/openai/images', async (req, res) => {
    if (!OPENAI_KEY) return openaiNotConfigured(res);
    try {
        const { prompt, model = 'dall-e-3', size = '1024x1024' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Proxying OpenAI image generation request...', {
            prompt: prompt.substring(0, 100) + '...',
            model,
            size
        });

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                prompt,
                n: 1,
                size,
                quality: 'standard',
                style: 'vivid'
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            return res.status(response.status).json({
                error: `OpenAI API error: ${response.status} - ${response.statusText}`,
                details: errorData
            });
        }

        const data = await response.json();
        console.log('OpenAI image generated successfully via proxy!');

        res.json({
            success: true,
            data,
            url: data.data[0].url,
            provider: 'openai-proxy'
        });
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`LearnAI server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    if (!OPENAI_KEY) {
        console.warn('⚠️  OPENAI_API_KEY is not set — AI features will return 503 until you add .env');
    }
});

module.exports = app;
