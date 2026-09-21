const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'bot-editais'
    })
});

client.on('qr', (qr) => {
    console.log('ESCANEIE O QR CODE ABAIXO COM O WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('=================================');
    console.log('BOT CONECTADO AO WHATSAPP!');
    console.log('=================================');
});

client.on('message', async (message) => {

    if (message.body.trim().toLowerCase() === '@teste') {
        await message.reply(
            '🤖 Teste realizado com sucesso! O bot de editais está conectado ao grupo.'
        );
    }

});

client.initialize();