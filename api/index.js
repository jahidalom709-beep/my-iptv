export default async function handler(req, res) {
  const CHANNEL_ID = "1703"; 
  
  try {
    const authReq = await fetch("https://toffeelive.com/api/v1/get-token", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://toffeelive.com/'
      }
    });
    
    const streamUrl = `https://owrcovcrpy.gpcdn.net/bpk-tv/${CHANNEL_ID}/output/1703-audio_113332_eng=113200-video=2202800.m3u8`;
    const m3uPlaylist = `#EXTM3U\n#EXTINF:-1, Live Channel\n${streamUrl}`;

    res.setHeader('Content-Type', 'application/x-mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(m3uPlaylist);
  } catch (error) {
    res.status(500).send("Token Generation Failed");
  }
}
