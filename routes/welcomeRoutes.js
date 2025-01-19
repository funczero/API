const express = require('express');
const router = express.Router();
const WelcomeConfig = require('../models/WelcomeConfig');

router.post('/set', async (req, res) => {
  const { guildId, channelId, title, description, image, color, status } = req.body;

  try {
    let config = await WelcomeConfig.findOne({ guildId });
    if (!config) {
      config = new WelcomeConfig({ guildId, channelId, title, description, image, color, status });
    } else {
      config.channelId = channelId || config.channelId;
      config.title = title || config.title;
      config.description = description || config.description;
      config.image = image || config.image;
      config.color = color || config.color;
      config.status = status !== undefined ? status : config.status;
    }
    await config.save();
    res.status(200).json({ message: 'Configuração salva com sucesso.', config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao salvar configuração.' });
  }
});

router.get('/get/:guildId', async (req, res) => {
  try {
    const config = await WelcomeConfig.findOne({ guildId: req.params.guildId });
    if (!config) return res.status(404).json({ message: 'Configuração não encontrada.' });
    res.status(200).json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar configuração.' });
  }
});

module.exports = router;