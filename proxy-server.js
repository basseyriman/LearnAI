// CORS Proxy Server for OpenAI Image Generation
// This server handles OpenAI API calls to bypass browser CORS restrictions

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static frontend files from the same directory
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'CORS Proxy Server is running' });
});

// OpenAI Image Generation Proxy Endpoint
app.post('/api/openai/images', async (req, res) => {
    try {
        const { apiKey, prompt, model = 'dall-e-3', size = '1024x1024' } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Proxying OpenAI image generation request...', {
            prompt: prompt.substring(0, 100) + '...',
            model,
            size
        });

        // Make the actual API call to OpenAI
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                n: 1,
                size: size,
                quality: "standard",
                style: "vivid"
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

        // Return the image data
        res.json({
            success: true,
            data: data,
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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
    console.log(`📡 OpenAI Image API endpoint: http://localhost:${PORT}/api/openai/images`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🔧 To use this proxy:');
    console.log('1. Install dependencies: npm install express cors node-fetch');
    console.log('2. Start server: node proxy-server.js');
    console.log('3. Configure your app to use http://localhost:3001/api/openai/images');
});

module.exports = app;
