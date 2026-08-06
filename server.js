const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// আপনার দেওয়া অরিজিনাল লিঙ্কটি
const SOURCE_URL = "https://biostartvworld.pages.dev/api/key/aHR0cHM6Ly9vd3Jjb3ZjcnB5LmdwY2RuLm5ldC9icGstdHYvMTcwMy9vdXRwdXQvMTcwMy1hdWRpb18xMTMzMzJfZW5nPTExMzIwMC12aWRlbz0yMjAyODAwLm0zdTh8fHx8fHx7ImVkZ2UtcG9saWN5IjoiZXlKVGRHRjBaVzFsYm5RaU9sdDdJbEpsYzI5MWNtTmxJam9pYUhSMGNITTZMeTl2ZDNKamIzWmpjbkI1TG1kd1kyUnVMbTVsZEM5aWNHc3RkSFl2TVRjd015OXZkWFJ3ZFhRdktpSXNJa052Ym1ScGRHbHZiaUk2ZXlKRVlYUmxUR1Z6YzFSb1lXNGlPbnNpUldSblpWUnBiV1VpT2pFM09EWXdNemt5TkROOWZYMWRmUSIsImVkZ2Utc2lnbmF0dXJlIjoiYkF3d3oxbEs2cVUwQ2Y1WWRqb1F4Zkg0YmFBbzVyajhCb2RmUGxiWk1RcyJ9/1703-audio_113332_eng=113200-video=2202800.m3u8";

app.get('/live.m3u8', async (req, res) => {
    try {
        const response = await axios.get(SOURCE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://biostartvworld.pages.dev/',
                'Origin': 'https://biostartvworld.pages.dev',
                'Accept': '*/*'
            }
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send(response.data);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Streaming Error: Blocked by Origin");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
