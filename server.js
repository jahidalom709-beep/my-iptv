const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';

app.get('/playlist.m3u', async (req, res) => {
    try {
        const response = await axios.get(HRIDOY_ORIGIN, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        let m3uContent = '#EXTM3U\n';

        // অপ্রয়োজনীয় কি-ওয়ার্ডের লিস্ট যা ফিল্টার হবে
        const ignoreList = ['telegram', 'whatsapp', 'apk', 'portal', 'github', 'gmail', 'tutorials', 'টিউটোরিয়াল', 'খুলুন'];

        $('a, div.channel-card, .btn').each((i, el) => {
            const name = $(el).text().trim() || $(el).attr('title') || '';
            const logo = $(el).find('img').attr('src') || '';
            let streamUrl = $(el).attr('href') || $(el).attr('data-url') || $(el).attr('onclick') || '';

            // ওয়ান-লাইন ফিল্টারিং: অপ্রয়োজনীয় লিংক বাদ দিয়ে শুধু ভিডিও/চ্যানেল লিংক নেওয়া
            const isInvalid = ignoreList.some(keyword => name.toLowerCase().includes(keyword) || streamUrl.toLowerCase().includes(keyword));

            if (name && streamUrl && !isInvalid && !streamUrl.startsWith('#') && !streamUrl.startsWith('javascript:')) {
                if (!streamUrl.startsWith('http')) {
                    streamUrl = new URL(streamUrl, HRIDOY_ORIGIN).href;
                }
                
                m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="Hridoy TV",${name.replace(/\n/g, ' ')}\n`;
                m3uContent += `${protocol}://${host}/stream?url=${encodeURIComponent(streamUrl)}\n`;
            }
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3uContent);
    } catch (error) {
        res.status(500).send('Filtering Error: ' + error.message);
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
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
