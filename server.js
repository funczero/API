const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const botInfo = {
  name: "Punishment",
  description: "Bot de moderação para Discord.",
  version: "1.0.0",
  developers: ["FuncZero"],
  prefix: ".",
  commands: [
    { name: "help", description: "Exibe todos os comandos disponíveis." },
    { name: "ban", description: "Bane um usuário do servidor." },
    { name: "kick", description: "Expulsa um usuário do servidor." },
    { name: "warn", description: "Envia um aviso para um usuário." },
  ],
};

app.get('/api/bot-info', (req, res) => {
  res.json(botInfo);
});

app.get('/api/commands', (req, res) => {
  res.json(botInfo.commands);
});

app.post('/api/commands', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Nome e descrição são obrigatórios." });
  }

  botInfo.commands.push({ name, description });
  res.status(201).json({ message: "Comando adicionado com sucesso.", commands: botInfo.commands });
});

app.post('/api/save-commands', (req, res) => {
  const commandsPath = path.join(__dirname, 'data', 'commands.json');

  try {
    fs.writeFileSync(commandsPath, JSON.stringify(botInfo.commands, null, 4));
    res.json({ message: "Comandos salvos com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar comandos:", error.message);
    res.status(500).json({ error: "Erro ao salvar os comandos." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});