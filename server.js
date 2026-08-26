const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';

// ১. HridoyTV-এর পেজ স্ক্র্যাপ করে সব চ্যানেল তৈরি করা
app.get('/playlist.m3u', async (req, res) => {
    try {
        // মূল ওয়েবসাইট ফেচ করা
        const response = await axios.get(HRIDOY_ORIGIN, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        let m3uContent = '#EXTM3U\n';

        // পেজের সকল চ্যানেল এলিমেন্ট খুঁজে বের করা
        $('a, div.channel, .card').each((i, el) => {
            const name = $(el).text().trim() || $(el).find('.title, h3, p').text().trim();
            const logo = $(el).find('img').attr('src') || '';
            let streamUrl = $(el).attr('href') || $(el).attr('data-url') || $(el).attr('data-stream');

            if (streamUrl && name) {
                if (!streamUrl.startsWith('http')) {
                    streamUrl = new URL(streamUrl, HRIDOY_ORIGIN).href;
                }
                
                m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="HridoyTV",${name.replace(/\n/g, ' ')}\n`;
                m3uContent += `${protocol}://${host}/stream?url=${encodeURIComponent(streamUrl)}\n`;
            }
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3uContent);
    } catch (error) {
        res.status(500).send('Scraping Error: ' + error.message);
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
