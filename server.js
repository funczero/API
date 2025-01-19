const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

app.post('/edit-image', async (req, res) => {
  const { imageUrl, title, description } = req.body;

  if (!imageUrl || !title || !description) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Envie imageUrl, title e description.' });
  }

  if (!isValidUrl(imageUrl)) {
    return res.status(400).json({ error: 'URL inválida para a imagem.' });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const safeTitle = title.replace(/"/g, "'");
    const safeDescription = description.replace(/"/g, "'");

    const editedImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(
            `<svg width="800" height="400">
              <rect x="0" y="0" width="800" height="400" fill="rgba(0, 0, 0, 0.5)" />
              <text x="400" y="150" font-size="40" fill="white" text-anchor="middle">${safeTitle}</text>
              <text x="400" y="300" font-size="30" fill="white" text-anchor="middle">${safeDescription}</text>
            </svg>`
          ),
          gravity: 'center',
        },
      ])
      .toBuffer();

    const fileName = `edited-${Date.now()}.png`;
    const filePath = path.join(imagesDir, fileName);
    fs.writeFileSync(filePath, editedImage);

    res.json({ imageUrl: `${req.protocol}://${req.get('host')}/images/${fileName}` });
  } catch (error) {
    console.error('Erro ao editar imagem:', error.stack || error.message);
    res.status(500).json({ error: `Erro ao editar a imagem: ${error.message}` });
  }
});

app.use('/images', express.static(imagesDir));

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.status(403).json({ error: 'Use HTTPS para acessar a API.' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});