const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();

const HRIDOY_URL = 'https://hridoytv.pages.dev';

app.get('/playlist.m3u', async (req, res) => {
    let browser;
    try {
        // Chromium হেডলেস ব্রাউজার চালু
        browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // HridoyTV পেজ লোড হওয়া এবং JS রান হওয়ার জন্য অপেক্ষা
        await page.goto(HRIDOY_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // পেজের ভেতর থেকে জাভাস্ক্রিপ্ট দিয়ে চ্যানেল এক্সট্র্যাক্ট করা
        const channels = await page.evaluate(() => {
            const list = [];
            const elements = document.querySelectorAll('a, .channel-item, .card, [data-url]');

            elements.forEach(el => {
                const name = el.innerText.trim() || el.getAttribute('title') || '';
                const logo = el.querySelector('img')?.src || '';
                let url = el.getAttribute('href') || el.getAttribute('data-url') || '';

                // চ্যানেল নয় এমন লিঙ্ক ফিল্টার করা
                const invalid = ['telegram', 'whatsapp', 'apk', 'portal', 'github', 'gmail', 'tutorial', 'খুলুন'];
                const isBad = invalid.some(k => name.toLowerCase().includes(k) || url.toLowerCase().includes(k));

                if (name && url && !isBad && !url.startsWith('#') && !url.startsWith('javascript:')) {
                    list.push({ name: name.replace(/\n/g, ' '), logo, url });
                }
            });
            return list;
        });

        await browser.close();

        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        let m3u = '#EXTM3U\n';
        channels.forEach(ch => {
            let streamUrl = ch.url.startsWith('http') ? ch.url : `${HRIDOY_URL}/${ch.url.replace(/^\//, '')}`;
            m3u += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="Hridoy TV",${ch.name}\n`;
            m3u += `${protocol}://${host}/stream?url=${encodeURIComponent(streamUrl)}\n`;
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(m3u);

    } catch (err) {
        if (browser) await browser.close();
        res.status(500).send('Browser Automation Error: ' + err.message);
    }
});

// Stream Proxy with Referer Header
app.get('/stream', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL required');

    try {
        const axios = require('axios');
        const streamResponse = await axios({
            method: 'get',
            url: targetUrl,
            headers: {
                'referer': `${HRIDOY_URL}/`,
                'origin': HRIDOY_URL,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            responseType: 'stream'
        });

        res.setHeader('Content-Type', 'application/x-mpegURL');
        streamResponse.data.pipe(res);
    } catch (error) {
        res.status(500).send('Stream relay failed');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
