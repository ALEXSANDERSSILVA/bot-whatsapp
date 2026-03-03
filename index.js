const express = require('express');
const app = express();

// Permite que o servidor entenda os dados em formato JSON que o WhatsApp envia
app.use(express.json());

// ROTA GET: Verificação de segurança do WhatsApp (Meta)
app.get('/webhook', (req, res) => {
    // Esse token você mesmo inventa e vai colar lá no painel do WhatsApp depois
    const MEU_TOKEN_DE_VERIFICACAO = "senha_secreta_123"; 

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === MEU_TOKEN_DE_VERIFICACAO) {
            console.log('✅ Webhook verificado com sucesso pelo WhatsApp!');
            res.status(200).send(challenge);
        } else {
            console.log('❌ Falha na verificação. Token incorreto.');
            res.sendStatus(403);
        }
    }
});

// ROTA POST: Onde você recebe as mensagens dos clientes
app.post('/webhook', (req, res) => {
    const dadosDaMensagem = req.body;

    console.log('\n💬 Nova mensagem recebida do WhatsApp:');
    // Mostra no terminal o conteúdo exato que o WhatsApp enviou
    console.dir(dadosDaMensagem, { depth: null }); 

    // É OBRIGATÓRIO responder com status 200 rapidamente, 
    // senão o WhatsApp acha que seu servidor caiu e tenta reenviar a mensagem.
    res.sendStatus(200); 
});

// Inicia o servidor na porta 3000
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
    console.log(`📡 Rota do Webhook: http://localhost:${PORTA}/webhook`);
});