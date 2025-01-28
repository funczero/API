const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const botInfo = {
  name: "Punishment",
  description: "Bot de moderação para Discord.",
  version: "1.0.0",
  developers: ["FuncZero"],
  prefix: ".",
  commands: [],
};

const commandsPath = path.join(__dirname, 'data', 'commands.json');

if (fs.existsSync(commandsPath)) {
  try {
    botInfo.commands = JSON.parse(fs.readFileSync(commandsPath, 'utf8'));
  } catch (error) {
    console.error("Erro ao carregar comandos salvos:", error.message);
  }
} else {
  const dataDir = path.dirname(commandsPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Erro de JSON:', err.message);
    return res.status(400).json({ error: 'JSON mal formatado. Por favor, verifique a sintaxe do corpo da requisição.' });
  }
  next();
});

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

  const existingCommand = botInfo.commands.find(cmd => cmd.name === name);
  if (existingCommand) {
    return res.status(400).json({ error: "O comando já existe." });
  }

  botInfo.commands.push({ name, description });
  try {
    fs.writeFileSync(commandsPath, JSON.stringify(botInfo.commands, null, 4));
    res.status(201).json({ message: "Comando adicionado e salvo com sucesso.", commands: botInfo.commands });
  } catch (error) {
    console.error("Erro ao salvar o comando:", error.message);
    res.status(500).json({ error: "Erro ao salvar o comando." });
  }
});

app.delete('/api/commands/:name', (req, res) => {
  const commandName = req.params.name;
  const commandIndex = botInfo.commands.findIndex(cmd => cmd.name === commandName);

  if (commandIndex === -1) {
    return res.status(404).json({ error: "Comando não encontrado." });
  }

  botInfo.commands.splice(commandIndex, 1);
  try {
    fs.writeFileSync(commandsPath, JSON.stringify(botInfo.commands, null, 4));
    res.json({ message: "Comando removido com sucesso.", commands: botInfo.commands });
  } catch (error) {
    console.error("Erro ao remover comando:", error.message);
    res.status(500).json({ error: "Erro ao remover o comando." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});