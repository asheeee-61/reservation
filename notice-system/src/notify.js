const express = require('express');
const router = express.Router();
const { sendMessage, isReady } = require('./whatsapp');
const { 
    formatReminder2h, 
    formatPostVisitReview, 
    formatCancellation,
    formatClientConfirmation,
    formatAdminNotification
} = require('./messages');

const authMiddleware = (req, res, next) => {
    const secret = req.headers['x-api-secret'];
    if (!secret || secret !== process.env.API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Secret' });
    }
    next();
};

router.use(authMiddleware);

// 1. Two hour reminder
router.post('/reminder-2h', async (req, res) => {
    const { customer, reservation, restaurantName } = req.body;
    if (!customer?.phone || !reservation) {
        return res.status(400).json({ error: 'Missing customer phone or reservation data' });
    }

    try {
        const msg = formatReminder2h({
            customerName: customer.name,
            date: reservation.date,
            time: reservation.time,
            restaurantName
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Recordatorio 2h');
        
        console.log(`✅ Reminder 2h sent to ${target}`);
        res.json({ status: 'sent', type: 'reminder-2h' });
    } catch (err) {
        console.error('❌ Failed to send reminder:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

// 2. Post visit review
router.post('/review', async (req, res) => {
    const { customer, reviewLink, restaurantName } = req.body;
    const link = reviewLink || process.env.REVIEW_LINK;

    if (!customer?.phone || !link) {
        return res.status(400).json({ error: 'Missing customer phone or review link' });
    }

    try {
        const msg = formatPostVisitReview({
            customerName: customer.name,
            reviewLink: link,
            restaurantName
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Solicitud Reseña');

        console.log(`✅ Review request sent to ${target}`);
        res.json({ status: 'sent', type: 'review' });
    } catch (err) {
        console.error('❌ Failed to send review request:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

// 3. Cancellation
router.post('/cancellation', async (req, res) => {
    const { customer, reason, restaurantName } = req.body;

    if (!customer?.phone) {
        return res.status(400).json({ error: 'Missing customer phone' });
    }

    try {
        const msg = formatCancellation({
            customerName: customer.name,
            reason,
            restaurantName
        });

        const target = process.env.TEST_PHONE || customer.phone;
        await sendMessage(target, msg, 'Cancelación');

        console.log(`✅ Cancellation notice sent to ${target}`);
        res.json({ status: 'sent', type: 'cancellation' });
    } catch (err) {
        console.error('❌ Failed to send cancellation notice:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

// 3.5. Confirmation (status update to confirmed)
router.post('/confirmed', async (req, res) => {
    const { reservation, customer, restaurantName } = req.body;

    if (!reservation || !customer) {
        return res.status(400).json({ error: 'Missing reservation or customer data' });
    }

    const data = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        customerName: customer.name,
        restaurantName
    };

    try {
        const msg = formatClientConfirmation(data);
        const target = process.env.TEST_PHONE || customer.phone;
        
        await sendMessage(target, msg, 'Confirmación');
        
        console.log(`✅ Confirmation sent to ${target} for reservation #${reservation.id}`);
        res.json({ status: 'sent', type: 'confirmed' });
    } catch (err) {
        console.error('❌ Failed to send confirmation:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

// 4. New reservation notification (client + admin)
router.post('/new-reservation', async (req, res) => {
    const { reservation, customer, zone, event, adminPhone, restaurantName } = req.body;

    if (!reservation || !customer) {
        return res.status(400).json({ error: 'Missing reservation or customer data' });
    }

    const data = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        customerName: customer.name,
        customerPhone: customer.phone,
        tableType: zone ? zone.name : null,
        specialEvent: event ? event.name : null,
        restaurantName
    };

    try {
        const clientMsg = formatClientConfirmation(data);
        const adminMsg = formatAdminNotification(data);

        const targetAdmin = process.env.TEST_PHONE || adminPhone;
        const targetClient = process.env.TEST_PHONE || customer.phone;

        const results = await Promise.allSettled([
            sendMessage(targetClient, clientMsg, 'Nueva Reserva (Cliente)'),
            sendMessage(targetAdmin, adminMsg, 'Nueva Reserva (Admin)')
        ]);

        console.log(`✅ New reservation notifications sent for #${reservation.id}`);
        res.json({ status: 'sent', details: results });
    } catch (err) {
        console.error('❌ Failed to send status update:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

module.exports = router;
