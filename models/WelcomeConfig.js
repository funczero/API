const mongoose = require('mongoose');

const WelcomeConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  title: { type: String, default: 'Bem-vindo(a)!' },
  description: { type: String, default: 'Bem-vindo(a) ao nosso servidor.' },
  image: { type: String, default: '' },
  color: { type: String, default: '#3498db' },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model('WelcomeConfig', WelcomeConfigSchema);