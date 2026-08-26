const express = require('express');
const axios = require('axios');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';

// Dynamic / Proxy M3U Endpoint
app.get('/playlist.m3u', async (req, res) => {
    try {
        // Direct M3U fetch fallback
        const response = await axios.get('https://raw.githubusercontent.com/jahidalom709-beep/my-iptv-flax.vercel.app/main/111.m3u');
        
        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(response.data);
    } catch (error) {
        // Fallback simple playlist response
        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send('#EXTM3U\n#EXTINF:-1,Hridoy TV\nhttps://hridoytv.pages.dev/');
    }
});

// Stream Relay Proxy
app.get('/stream', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL required');

    try {
        const streamResponse = await axios({
            method: 'get',
            url: targetUrl,
            headers: {
                'referer': `${HRIDOY_ORIGIN}/`,
                'origin': HRIDOY_ORIGIN,
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
            },
            responseType: 'stream'
        });

        res.setHeader('Content-Type', 'application/x-mpegURL');
        streamResponse.data.pipe(res);
    } catch (error) {
        res.status(500).send('Stream error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
