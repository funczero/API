const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

app.post('/edit-image', async (req, res) => {
  const { imageUrl, title, description } = req.body;

  if (!imageUrl || !title || !description) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Envie imageUrl, title e description.' });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const editedImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(
            `<svg width="800" height="400">
              <rect x="0" y="0" width="800" height="400" fill="rgba(0, 0, 0, 0.5)" />
              <text x="400" y="150" font-size="40" fill="white" text-anchor="middle">${title}</text>
              <text x="400" y="300" font-size="30" fill="white" text-anchor="middle">${description}</text>
            </svg>`
          ),
          gravity: 'center',
        },
      ])
      .toBuffer();

    const fileName = `edited-${Date.now()}.png`;
    const filePath = path.join(__dirname, 'images', fileName);
    fs.writeFileSync(filePath, editedImage);

    res.json({ imageUrl: `http://localhost:3000/images/${fileName}` });
  } catch (error) {
    console.error('Erro ao editar imagem:', error.message);
    res.status(500).json({ error: 'Erro ao editar a imagem.' });
  }
});

app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});