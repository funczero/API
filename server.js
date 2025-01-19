const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send({
        message: 'API Punishment está funcionando!',
        status: 'online',
        version: '1.0.0',
    });
});

app.get('/api/example', (req, res) => {
    res.json({
        data: 'Exemplo de dados retornados pela API.',
    });
});

app.use((req, res) => {
    res.status(404).send({
        error: 'Rota não encontrada',
        message: 'Verifique o endpoint e tente novamente.',
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});