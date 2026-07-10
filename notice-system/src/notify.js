const express = require('express');
const router = express.Router();
const { sendMessage, isReady } = require('./whatsapp');
const {
    formatReminder2h,
    formatCancellation,
    formatClientReceived,
    formatClientConfirmation
} = require('./messages');

const ts = () => new Date().toISOString();

const authMiddleware = (req, res, next) => {
    const secret = req.headers['x-api-secret'];
    if (!secret || secret !== process.env.API_SECRET) {
        console.warn(`[${ts()}] 🚫 [AUTH_FAILED] ${req.method} ${req.path} — invalid or missing x-api-secret`);
        return res.status(401).json({ error: 'Unauthorized: Invalid API Secret' });
    }
    next();
};

router.use(authMiddleware);

// 1. Two hour reminder
router.post('/reminder-2h', async (req, res) => {
    const { customer, reservation, restaurantName, businessName, address, id } = req.body;
    const finalBusinessName = businessName || restaurantName;
    const finalId = id || reservation?.id;

    if (!customer?.phone || !reservation) {
        console.warn(`[${ts()}] ⚠️ [REMINDER_2H] Missing required fields — customer.phone=${customer?.phone} reservation=${!!reservation}`);
        return res.status(400).json({ error: 'Missing customer phone or reservation data' });
    }

    if (!isReady()) {
        console.warn(`[${ts()}] ⚠️ [REMINDER_2H] WhatsApp not connected — skipping send to ${customer.phone}`);
        return res.status(503).json({ error: 'WhatsApp not connected', code: 'WA_NOT_READY' });
    }

    try {
        const msg = formatReminder2h({
            id: finalId,
            customerName: customer.name,
            date: reservation.date,
            time: reservation.time,
            businessName: finalBusinessName,
            address
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Recordatorio 2h');

        res.json({ status: 'sent', type: 'reminder-2h', body: msg });
    } catch (err) {
        console.error(`[${ts()}] ❌ [REMINDER_2H] reservation=#${finalId} to=${customer.phone} — ${err.message}`);
        res.status(500).json({ error: 'Failed to send WhatsApp message', code: 'SEND_FAILED', details: err.message });
    }
});

// 2. Cancellation
router.post('/cancellation', async (req, res) => {
    const { customer, reason, restaurantName, businessName, address, id } = req.body;
    const finalBusinessName = businessName || restaurantName;
    const finalId = id || (req.body.reservation ? req.body.reservation.id : null);

    if (!customer?.phone) {
        console.warn(`[${ts()}] ⚠️ [CANCELLATION] Missing customer.phone`);
        return res.status(400).json({ error: 'Missing customer phone' });
    }

    if (!isReady()) {
        console.warn(`[${ts()}] ⚠️ [CANCELLATION] WhatsApp not connected — skipping send to ${customer.phone}`);
        return res.status(503).json({ error: 'WhatsApp not connected', code: 'WA_NOT_READY' });
    }

    try {
        const msg = formatCancellation({
            id: finalId,
            customerName: customer.name,
            reason,
            businessName: finalBusinessName,
            address
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Cancelación');

        res.json({ status: 'sent', type: 'cancellation', body: msg });
    } catch (err) {
        console.error(`[${ts()}] ❌ [CANCELLATION] reservation=#${finalId} to=${customer.phone} — ${err.message}`);
        res.status(500).json({ error: 'Failed to send WhatsApp message', code: 'SEND_FAILED', details: err.message });
    }
});

// 3. Confirmation
router.post('/confirmed', async (req, res) => {
    const { reservation, customer, restaurantName, businessName, address, id } = req.body;
    const finalBusinessName = businessName || restaurantName;
    const finalId = id || reservation?.id;

    if (!reservation || !customer) {
        console.warn(`[${ts()}] ⚠️ [CONFIRMED] Missing required fields — reservation=${!!reservation} customer=${!!customer}`);
        return res.status(400).json({ error: 'Missing reservation or customer data' });
    }

    if (!isReady()) {
        console.warn(`[${ts()}] ⚠️ [CONFIRMED] WhatsApp not connected — skipping send to ${customer.phone}`);
        return res.status(503).json({ error: 'WhatsApp not connected', code: 'WA_NOT_READY' });
    }

    try {
        const msg = formatClientConfirmation({
            id: finalId,
            date: reservation.date,
            time: reservation.time,
            guests: reservation.guests,
            customerName: customer.name,
            businessName: finalBusinessName,
            address
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Confirmación');

        res.json({ status: 'sent', type: 'confirmed', body: msg });
    } catch (err) {
        console.error(`[${ts()}] ❌ [CONFIRMED] reservation=#${finalId} to=${customer.phone} — ${err.message}`);
        res.status(500).json({ error: 'Failed to send WhatsApp message', code: 'SEND_FAILED', details: err.message });
    }
});

// 4. New reservation
router.post('/new-reservation', async (req, res) => {
    const { reservation, customer, zone, event, businessName, restaurantName, address, id } = req.body;
    const finalBusinessName = businessName || restaurantName;
    const finalId = id || reservation?.id;

    if (!reservation || !customer) {
        console.warn(`[${ts()}] ⚠️ [NEW_RESERVATION] Missing required fields — reservation=${!!reservation} customer=${!!customer}`);
        return res.status(400).json({ error: 'Missing reservation or customer data' });
    }

    if (!isReady()) {
        console.warn(`[${ts()}] ⚠️ [NEW_RESERVATION] WhatsApp not connected — skipping send to ${customer.phone}`);
        return res.status(503).json({ error: 'WhatsApp not connected', code: 'WA_NOT_READY' });
    }

    console.log(`[${ts()}] 📩 [NEW_RESERVATION] reservation=#${finalId} customer=${customer.name} (${customer.phone})`);

    try {
        const clientMsg = formatClientReceived({
            id: finalId,
            date: reservation.date,
            time: reservation.time,
            guests: reservation.guests,
            customerName: customer.name,
            customerPhone: customer.phone,
            tableType: zone ? zone.name : null,
            specialEvent: event ? event.name : null,
            businessName: finalBusinessName,
            address
        });

        const targetClient = process.env.TEST_PHONE || customer.phone;
        await sendMessage(targetClient, clientMsg, 'Nueva Reserva (Cliente)');

        res.json({ status: 'processed', reservationId: finalId, client: 'sent', body: clientMsg });
    } catch (err) {
        console.error(`[${ts()}] ❌ [NEW_RESERVATION] reservation=#${finalId} to=${customer.phone} — ${err.message}`);
        res.status(500).json({ error: 'Failed to send WhatsApp message', code: 'SEND_FAILED', details: err.message });
    }
});

module.exports = router;
