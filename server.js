const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Lien M3U d'origine
const IPTV_URL = "http://001122.org:2095/get.php?username=45645678644789&password=45645678644456&type=m3u_plus&output=t";

// Mots à filtrer
const blacklist = ["test", "adult", "adulte", "xxx"];

// Route principale : playlist filtrée
app.get('/playlist.m3u', async (req, res) => {
  try {
    const response = await axios.get(IPTV_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "*/*"
      },
      responseType: "text",
      timeout: 10000000,
      maxRedirects: 5
    });

    const lines = response.data.split('\n');
    const filtered = ['#EXTM3U']; // toujours inclure l'entête
    let skip = false;

    for (let line of lines) {
      if (line.startsWith('#EXTINF')) {
        const lower = line.toLowerCase();
        skip = blacklist.some(word => lower.includes(word));
      }

      if (line.startsWith('http') && skip) {
        skip = false;
        continue;
      }

      if (!skip && line.trim() !== '') {
        filtered.push(line);
      }
    }

    if (filtered.length <= 1) {
      return res.status(204).send('Filtered playlist is empty.');
    }

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', 'inline; filename=playlist_filtered.m3u');
    res.send(filtered.join('\n'));

  } catch (error) {
    console.error('Fetch or filter error:', error.message);
    res.status(500).send('Failed to fetch or process playlist.');
  }
});

// Compatibilité Xtream Codes : /get.php redirige vers /playlist.m3u
app.get('/get.php', (req, res) => {
  const { username, password, type } = req.query;

  if (
    username !== '45645678644789' ||
    password !== '45645678644456' ||
    type !== 'm3u_plus'
  ) {
    return res.status(401).send('Unauthorized');
  }

  res.redirect('/playlist.m3u');
});

// Page d'accueil
app.get('/', (req, res) => {
  res.send('✅ IPTV Cleaner is running. Use /playlist.m3u or Xtream-compatible /get.php endpoint.');
});

app.listen(PORT, () => {
  console.log(`🎧 IPTV Cleaner running on http://localhost:${PORT}`);
});