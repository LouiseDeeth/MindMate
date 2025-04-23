const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Angular app's domain
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200'
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Create a proxy endpoint for Claude API
app.post('/api/chat', async (req, res) => {
    try {
        // Extract Claude API details from the request
        const { apiKey, model, messages, system, max_tokens, temperature } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Make the request to Claude API
        const claudeResponse = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: model || 'claude-3-opus-20240229',
                messages: messages,
                system: system,
                max_tokens: max_tokens || 1024,
                temperature: temperature || 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                }
            }
        );

        // Transform the response to the format expected by your frontend
        const responseData = {
            content: claudeResponse.data.content[0].text,
            role: 'assistant'
        };

        return res.json(responseData);
    } catch (error) {
        console.error('Error proxying to Claude API:', error.response?.data || error.message);

        // Return appropriate status codes based on Claude API responses
        if (error.response) {
            return res.status(error.response.status).json({
                error: error.response.data?.error?.message || 'Error from Claude API'
            });
        }

        return res.status(500).json({ error: 'Failed to communicate with Claude API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`API proxy server running on port ${PORT}`);
});