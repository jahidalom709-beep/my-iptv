const express = require('express');
const axios = require('axios');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';

app.get('/playlist.m3u', async (req, res) => {
    try {
        const response = await axios.get(`${HRIDOY_ORIGIN}/json/channels.json`, {
            headers: {
                'referer': `${HRIDOY_ORIGIN}/`,
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            }
        });

        let rawData = response.data;
        // ডাটা যদি Array না হয়ে Object এর ভেতর থাকে তবে তা বের করে আনা
        let channels = Array.isArray(rawData) 
            ? rawData 
            : (rawData.channels || rawData.data || rawData.list || Object.values(rawData));

        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        let m3uContent = '#EXTM3U\n';

        if (Array.isArray(channels)) {
            channels.forEach(ch => {
                if (typeof ch === 'object' && ch !== null) {
                    const name = ch.name || ch.title || ch.channel_name || 'Channel';
                    const logo = ch.logo || ch.image || ch.icon || '';
                    const category = ch.category || ch.group || 'HridoyTV';
                    const streamUrl = ch.link || ch.url || ch.stream_url || ch.file;

                    if (streamUrl && typeof streamUrl === 'string') {
                        m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="${category}",${name}\n`;
                        m3uContent += `${protocol}://${host}/stream?url=${encodeURIComponent(streamUrl)}\n`;
                    }
                }
            });
        }

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3uContent);
    } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('HridoyTV Channel Source Error: ' + error.message);
    }
});

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
