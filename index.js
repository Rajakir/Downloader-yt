
const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

let videoFormats; // Declare the variable outside the route handlers

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/download', async (req, res) => {
  const url = req.query.url;

  try {
    const info = await ytdl.getInfo(url);
    videoFormats = info.formats.filter(format => format.hasVideo);

    res.render('download', {
      url,
      videoFormats,
    });
  } catch (error) {
    res.send('Error fetching video information');
  }
});

app.get('/download/:itag', (req, res) => {
  const { url, videoQuality } = req.query;

  // Make sure videoFormats is defined
  if (!videoFormats) {
    res.send('Video formats not available. Please go back and enter a valid YouTube URL.');
    return;
  }

  const videoFormat = videoFormats.find(format => format.quality === videoQuality);

  if (videoFormat) {
    res.header('Content-Disposition', `attachment; filename="${videoFormat.qualityLabel}.mp4"`);
    ytdl(url, { format: videoFormat }).pipe(res);
  } else {
    res.send('Invalid format');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
