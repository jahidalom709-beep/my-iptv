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

// অরিজিনাল কী এবং পলিসি প্রসেসিং
const TARGET_KEY_URL = "https://biostartvworld.pages.dev/api/key/aHR0cHM6Ly9vd3Jjb3ZjcnB5LmdwY2RuLm5ldC9icGstdHYvMTcwMy9vdXRwdXQvMTcwMy1hdWRpb18xMTMzMzJfZW5nPTExMzIwMC12aWRlbz0yMjAyODAwLm0zdTh8fHx8fHx7ImVkZ2UtcG9saWN5IjoiZXlKVGRHRjBaVzFsYm5RaU9sdDdJbEpsYzI5MWNtTmxJam9pYUhSMGNITTZMeTl2ZDNKamIzWmpjbkI1TG1kd1kyUnVMbTVsZEM5aWNHc3RkSFl2TVRjd015OXZkWFJ3ZFhRdktpSXNJa052Ym1ScGRHbHZiaUk2ZXlKRVlYUmxUR1Z6YzFSb1lXNGlPbnNpUldSblpWUnBiV1VpT2pFM09EWXdNemt5TkROOWZYMWRmUSIsImVkZ2Utc2lnbmF0dXJlIjoiYkF3d3oxbEs2cVUwQ2Y1WWRqb1F4Zkg0YmFBbzVyajhCb2RmUGxiZlpNQXMifQ==/1703-audio_113332_eng=113200-video=2202800.m3u8";

app.get('/', (req, res) => {
    res.send("Server is Active. Use /live.m3u8 for streaming.");
});

app.get('/live.m3u8', async (req, res) => {
    try {
        // সোর্স থেকে ডাটা রিড করা
        const response = await axios.get(TARGET_KEY_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*'
            }
        });

        // রেসপন্স সরাসরি ব্রাউজার/প্লেয়ারে পাস করে দেওয়া
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(response.data);

    } catch (error) {
        console.error("Proxy Fetch Error:", error.message);
        res.status(500).send("Source Link Error or Expired");
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
