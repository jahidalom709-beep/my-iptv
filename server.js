const express = require('express');
const axios = require('axios');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';
const HRIDOY_WORKER = 'https://sports-play.hridoytv-master.workers.dev/proxy';

// ১. Dynamic M3U Playlist Generator
app.get('/playlist.m3u', async (req, res) => {
    try {
        // HridoyTV-এর আসল চ্যানেল লিস্ট API ফেচ করা
        const response = await axios.get(`${HRIDOY_ORIGIN}/api/channels.json`, {
            headers: {
                'Referer': `${HRIDOY_ORIGIN}/`,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            }
        });

        let m3uContent = '#EXTM3U\n';
        const channels = response.data;

        channels.forEach(ch => {
            m3uContent += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="${ch.category}",${ch.name}\n`;
            // আপনার সার্ভারের মাধ্যমে স্ট্রিম রিডাইরেক্ট হবে
            m3uContent += `http://${req.headers.host}/stream?url=${encodeURIComponent(ch.stream_url)}\n`;
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3uContent);
    } catch (error) {
        res.status(500).send('Playlist generation failed');
    }
});

// ২. Stream Proxy Handling (Auto Headers + Bypass)
app.get('/stream', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL required');

    try {
        const streamResponse = await axios({
            method: 'get',
            url: targetUrl,
            headers: {
                'authority': 'sports-play.hridoytv-master.workers.dev',
                'referer': `${HRIDOY_ORIGIN}/`,
                'origin': HRIDOY_ORIGIN,
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            responseType: 'stream'
        });

        res.setHeader('Content-Type', 'application/x-mpegURL');
        streamResponse.data.pipe(res);
    } catch (error) {
        res.status(500).send('Stream relay error');
    }
});

app.listen(3000, () => console.log('Proxy Server Running on Port 3000'));
