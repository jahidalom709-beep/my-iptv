const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

const TARGET_URL = "https://biostartvworld.pages.dev/api/key/aHR0cHM6Ly9vd3Jjb3ZjcnB5LmdwY2RuLm5ldC9icGstdHYvMTcwMy9vdXRwdXQvMTcwMy1hdWRpb18xMTMzMzJfZW5nPTExMzIwMC12aWRlbz0yMjAyODAwLm0zdTh8fHx8fHx7ImVkZ2Utc2lnbmF0dXJlIjoiYkF3d3oxbEs2cVUwQ2Y1WWRqb1F4Zkg0YmFBbzVyajhCb2RmUGxiWk1RcyJ9/1703-audio_113332_eng=113200-video=2202800.m3u8";

app.get('/live.m3u8', async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: TARGET_URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site'
            },
            timeout: 10000
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(response.data);

    } catch (error) {
        console.error("Fetch failed:", error.response ? error.response.status : error.message);
        // আসল এরর কোড স্ক্রিনে দেখাবে
        const status = error.response ? error.response.status : 500;
        const msg = error.response ? JSON.stringify(error.response.data) : error.message;
        res.status(status).send(`Error ${status}: ${msg}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
