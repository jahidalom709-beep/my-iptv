const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const BASE_SOURCE_API = "https://biostartvworld.pages.dev/api/key/aHR0cHM6Ly9vd3Jjb3ZjcnB5LmdwY2RuLm5ldC9icGstdHYvMTcwMy9vdXRwdXQvMTcwMy1hdWRpb18xMTMzMzJfZW5nPTExMzIwMC12aWRlbz0yMjAyODAwLm0zdTh8fHx8fHx7ImVkZ2UtcG9saWN5IjoiZXlKVGRHRjBaVzFsYm5RaU9sdDdJbEpsYzI5MWNtTmxJam9pYUhSMGNITTZMeTl2ZDNKamIzWmpjbkI1TG1kd1kyUnVMbTVsZEM5aWNHc3RkSFl2TVRjd015OXZkWFJ3ZFhRdktpSXNJa052Ym1ScGRHbHZiaUk2ZXlKRVlYUmxUR1Z6YzFSb1lXNGlPbnNpUldSblpWUnBiV1VpT2pFM09EWXdNemt5TkROOWZYMWRmUSIsImVkZ2Utc2lnbmF0dXJlIjoiYkF3d3oxbEs2cVUwQ2Y1WWRqb1F4Zkg0YmFBbzVyajhCb2RmUGxiZlpNQXMifQ==/1703-audio_113332_eng=113200-video=2202800.m3u8";

function parseDecodedInfo(proxyUrl) {
    try {
        const parts = proxyUrl.split('/api/key/')[1].split('/');
        const base64Data = decodeURIComponent(parts[0]);
        const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');
        const [rawUrl, jsonPolicy] = decodedString.split('||||||');
        const policyObj = JSON.parse(jsonPolicy);

        const cookieHeader = `edge-policy=${Buffer.from(JSON.stringify(policyObj)).toString('base64')}; edge-signature=${policyObj['edge-signature'] || ''}`;

        return { streamUrl: rawUrl, cookie: cookieHeader };
    } catch (err) {
        return null;
    }
}

app.get('/live.m3u8', async (req, res) => {
    try {
        let streamUrl, cookie;

        if (req.query.segment) {
            streamUrl = Buffer.from(req.query.segment, 'base64').toString('utf-8');
            cookie = req.query.ck ? Buffer.from(req.query.ck, 'base64').toString('utf-8') : '';
        } else {
            const info = parseDecodedInfo(BASE_SOURCE_API);
            if (!info) return res.status(500).send("Source Link Parsing Error");
            streamUrl = info.streamUrl;
            cookie = info.cookie;
        }

        const response = await axios.get(streamUrl, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://owrcovcrpy.gpcdn.net/'
            },
            responseType: streamUrl.includes('.m3u8') ? 'text' : 'arraybuffer'
        });

        if (streamUrl.includes('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
            const lines = response.data.split('\n');

            const modifiedLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const fullUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
                    const encodedUrl = Buffer.from(fullUrl).toString('base64');
                    const encodedCookie = Buffer.from(cookie).toString('base64');
                    return `${req.protocol}://${req.get('host')}/live.m3u8?segment=${encodeURIComponent(encodedUrl)}&ck=${encodeURIComponent(encodedCookie)}`;
                }
                return line;
            });

            return res.send(modifiedLines.join('\n'));
        } else {
            res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
            return res.send(response.data);
        }

    } catch (error) {
        res.status(500).send('Streaming Error');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
