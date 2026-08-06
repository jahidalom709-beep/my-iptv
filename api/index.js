export default async function handler(req, res) {
  const CHANNEL_ID = "1703"; 
  const streamUrl = `https://owrcovcrpy.gpcdn.net/bpk-tv/${CHANNEL_ID}/output/1703-audio_113332_eng=113200-video=2202800.m3u8`;

  // Televizo বা অন্য IPTV অ্যাপের জন্য M3U8 ফরম্যাট
  const m3uPlaylist = `#EXTM3U
#EXTINF:-1 tvg-id="${CHANNEL_ID}" tvg-name="Toffee Live" group-title="Live", Live Channel
#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
#EXTVLCOPT:http-referrer=https://toffeelive.com/
${streamUrl}`;

  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(m3uPlaylist);
}
