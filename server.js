const express = require('express');
const axios = require('axios');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';

// ১. HridoyTV-এর মূল API থেকে সব চ্যানেল ডায়নামিকালি টেনে আনা
app.get('/playlist.m3u', async (req, res) => {
    try {
        const response = await axios.get(`${HRIDOY_ORIGIN}/json/channels.json`, {
            headers: {
                'referer': `${HRIDOY_ORIGIN}/`,
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            }
        });

        const channels = response.data;
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        let m3uContent = '#EXTM3U\n';

        channels.forEach(ch => {
            const name = ch.name || ch.title || 'Channel';
            const logo = ch.logo || ch.image || '';
            const category = ch.category || 'HridoyTV';
            const streamUrl = ch.link || ch.url || ch.stream_url;

            if (streamUrl) {
                m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="${category}",${name}\n`;
                m3uContent += `${protocol}://${host}/stream?url=${encodeURIComponent(streamUrl)}\n`;
            }
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3uContent);
    } catch (error) {
        // Fallback: API পাথ অমিল হলে সরাসরি পেজ স্ক্র্যাপ করার ব্যাকআপ
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('HridoyTV Channel Source Error: ' + error.message);
    }
});

// ২. স্ট্রিম হ্যান্ডলার
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
