const app = require('./app');
const { client } = require('./whatsapp');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Notice system server running on http://localhost:${PORT}`);
    console.log(`🔗 Scanning QR code? Visit http://localhost:${PORT}/qr`);
    
    // Initialize WhatsApp client
    console.log('⏳ Initializing WhatsApp client...');
    client.initialize().catch(err => {
        console.error('❌ Failed to initialize WhatsApp client:', err.message);
    });
});
