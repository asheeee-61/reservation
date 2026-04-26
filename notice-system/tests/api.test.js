const request = require('supertest');
const app = require('../src/app');

// Mock whatsapp.js
jest.mock('../src/whatsapp', () => ({
    sendMessage: jest.fn().mockResolvedValue({ id: 'mock_message_id' }),
    formatClientMessage: jest.fn().mockReturnValue('Mock Client Message'),
    formatAdminMessage: jest.fn().mockReturnValue('Mock Admin Message'),
    isReady: jest.fn().mockReturnValue(true),
    getLastQR: jest.fn().mockReturnValue('mock_qr_string')
}));

process.env.API_SECRET = 'test_secret';
process.env.ADMIN_ACCESS_TOKEN = 'test_token';

describe('Notice System API', () => {

    it('should deny access without secret', async () => {
        const res = await request(app).post('/notify/new-reservation').send({});
        expect(res.status).toBe(401);
    });

    it('should deny access with wrong secret', async () => {
        const res = await request(app)
            .post('/notify/new-reservation')
            .set('x-api-secret', 'wrong_secret')
            .send({});
        expect(res.status).toBe(401);
    });

    it('should return 400 for missing request data', async () => {
        const res = await request(app)
            .post('/notify/new-reservation')
            .set('x-api-secret', 'test_secret')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return 200 for valid data', async () => {
        const payload = {
            reservation: { id: 1, date: '2026-03-28', time: '20:00', guests: 2 },
            customer: { name: 'Juan Doe', phone: '34600000001' },
            zone: { name: 'Terraza' },
            event: { name: 'Cumpleaños' }
        };

        const res = await request(app)
            .post('/notify/new-reservation')
            .set('x-api-secret', 'test_secret')
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('processed');
    });

    it('GET /qr should show connected status if ready', async () => {
        const res = await request(app).get('/qr?token=test_token');
        expect(res.text).toContain('WhatsApp conectado');
    });

    it('GET / should redirect to /monitoring', async () => {
        const res = await request(app).get('/?token=test_token');
        expect(res.status).toBe(302);
        expect(res.headers.location).toContain('/monitoring');
    });
});
