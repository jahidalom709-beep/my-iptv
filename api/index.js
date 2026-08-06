export default async function handler(req, res) {
  try {
    // Toffee Channel/Stream Token API URL
    const response = await fetch("https://toffeelive.com/api/v1/channels/1703", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Android Mobile)",
        "Referer": "https://toffeelive.com/"
      }
    });

    // M3U Playlist Response
    const m3uPlaylist = `#EXTM3U
#EXTINF:-1 tvg-id="1703" tvg-name="Toffee Live" group-title="Live", Toffee Live
#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
#EXTVLCOPT:http-referrer=https://toffeelive.com/
https://owrcovcrpy.gpcdn.net/bpk-tv/1703/output/1703-audio_113332_eng=113200-video=2202800.m3u8`;

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(m3uPlaylist);
  } catch (error) {
    res.status(500).send("Error fetching stream token");
  }
}
