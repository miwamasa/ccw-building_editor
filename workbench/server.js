const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定（開発環境用）
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静的ファイルの提供
app.use(express.static(__dirname));

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenAI APIプロキシ
app.post('/api/openai', async (req, res) => {
    try {
        const { apiKey, model, prompt, endpoint } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const apiEndpoint = endpoint || 'https://api.openai.com/v1';
        const response = await fetch(`${apiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json({
            success: true,
            content: data.choices[0].message.content,
            usage: data.usage
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            error: error.message,
            type: 'server_error'
        });
    }
});

// Anthropic APIプロキシ
app.post('/api/anthropic', async (req, res) => {
    try {
        const { apiKey, model, prompt, endpoint } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const apiEndpoint = endpoint || 'https://api.anthropic.com/v1';
        const response = await fetch(`${apiEndpoint}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json({
            success: true,
            content: data.content[0].text,
            usage: data.usage
        });
    } catch (error) {
        console.error('Anthropic API Error:', error);
        res.status(500).json({
            error: error.message,
            type: 'server_error'
        });
    }
});

// Google Gemini APIプロキシ
app.post('/api/google', async (req, res) => {
    try {
        const { apiKey, model, prompt, endpoint } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const apiEndpoint = endpoint || 'https://generativelanguage.googleapis.com/v1';
        const response = await fetch(`${apiEndpoint}/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json({
            success: true,
            content: data.candidates[0].content.parts[0].text,
            usage: data.usageMetadata
        });
    } catch (error) {
        console.error('Google API Error:', error);
        res.status(500).json({
            error: error.message,
            type: 'server_error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Building Model Workbench - Backend Server                 ║
╠════════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: ${PORT}                                              ║
║  URL: http://localhost:${PORT}                             ║
║                                                            ║
║  Endpoints:                                                ║
║    GET  /health           - Health check                  ║
║    POST /api/openai       - OpenAI proxy                  ║
║    POST /api/anthropic    - Anthropic proxy               ║
║    POST /api/google       - Google Gemini proxy           ║
║                                                            ║
║  Frontend: http://localhost:${PORT}/building_model_workbench.html ║
╚════════════════════════════════════════════════════════════╝
    `);
});
