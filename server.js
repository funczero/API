const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Erro de JSON:', err.message);
    return res.status(400).json({ error: 'JSON mal formatado. Verifique a sintaxe do corpo da requisição.' });
  }
  next();
});

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

const sanitizeText = (text) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "'");
};

app.post('/edit-image', async (req, res) => {
  const { imageUrl, title, description } = req.body;

  if (!imageUrl || !title || !description) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Envie imageUrl, title e description.' });
  }

  if (!isValidUrl(imageUrl)) {
    return res.status(400).json({ error: 'URL inválida para a imagem.' });
  }

  if (title.length > 50 || description.length > 100) {
    return res.status(400).json({ error: 'Título ou descrição muito longos.' });
  }

  try {
    console.log('Recebido:', JSON.stringify(req.body, null, 2));

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const editedImage = await sharp(imageBuffer)
      .resize(800, 400)
      .composite([
        {
          input: Buffer.from(
            `<svg width="800" height="400">
              <rect x="0" y="0" width="800" height="400" fill="rgba(0, 0, 0, 0.5)" />
              <text x="400" y="150" font-size="40" fill="white" text-anchor="middle">${sanitizeText(title)}</text>
              <text x="400" y="300" font-size="30" fill="white" text-anchor="middle">${sanitizeText(description)}</text>
            </svg>`
          ),
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer();

    const fileName = `edited-${Date.now()}.png`;
    const filePath = path.join(imagesDir, fileName);
    await fs.promises.writeFile(filePath, editedImage);

    res.json({ imageUrl: `${req.protocol}://${req.get('host')}/images/${fileName}` });
  } catch (error) {
    console.error('Erro ao editar imagem:', error.stack || error.message);
    res.status(500).json({ error: `Erro ao editar a imagem: ${error.message}` });
  }
});

app.use('/images', express.static(imagesDir));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});