const axios = require('axios');

const HRIDOY_ORIGIN = 'https://hridoytv.pages.dev';
const GITHUB_M3U = 'https://raw.githubusercontent.com/jahidalom709-beep/my-iptv-flax.vercel.app/main/111.m3u';

module.exports = async (req, res) => {
    const { path, query } = req;

    // Stream Relay Handler
    if (query.url) {
        try {
            const streamResponse = await axios({
                method: 'get',
                url: query.url,
                headers: {
                    'referer': `${HRIDOY_ORIGIN}/`,
                    'origin': HRIDOY_ORIGIN,
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                responseType: 'stream'
            });

            res.setHeader('Content-Type', 'application/x-mpegURL');
            return streamResponse.data.pipe(res);
        } catch (error) {
            return res.status(500).send('Stream relay error');
        }
    }

    // M3U Playlist Handler
    try {
        const response = await axios.get(GITHUB_M3U);
        let rawM3u = response.data;
        const host = req.headers.host;
        const protocol = 'https';

        let lines = rawM3u.split('\n');
        let modifiedLines = lines.map(line => {
            let trimmed = line.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return `${protocol}://${host}/api?url=${encodeURIComponent(trimmed)}`;
            }
            return line;
        });

        res.setHeader('Content-Type', 'audio/x-mpegurl');
        res.send(modifiedLines.join('\n'));
    } catch (error) {
        res.status(500).send('Playlist fetch error');
    }
};
