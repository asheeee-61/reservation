/**
 * Message templates for WhatsApp notifications
 * Rules: Professional formal Spanish, no emojis.
 * restaurantName is passed from the backend payload dynamically.
 */

const DEFAULT_BUSINESS = process.env.BUSINESS_NAME || 'Business';

const formatClientReceived = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent, businessName = DEFAULT_BUSINESS } = data;
    return `SOLICITUD DE RESERVA RECIBIDA - ${businessName}

Estimado/a ${customerName}, hemos recibido su solicitud.

Detalles:
- Fecha: ${date}
- Hora: ${time}
- Personas: ${guests}
- Zona: ${tableType || 'Estándar'}
- Evento: ${specialEvent || 'Ninguno'}
- Referencia: #${id}

Le confirmaremos en breve. Muchas gracias.`;
};

const formatClientConfirmation = (data) => {
    const { id, customerName, businessName = DEFAULT_BUSINESS } = data;
    return `Estimado/a ${customerName}, le informamos que su reserva #${id} en ${businessName} ha sido CONFIRMADA. Le esperamos.`;
};

const formatCancellation = (data) => {
    const { id, customerName, reason, businessName = DEFAULT_BUSINESS } = data;
    const reasonText = reason ? ` por el siguiente motivo: ${reason}` : '';
    return `Estimado/a ${customerName}, le informamos que su reserva #${id} en ${businessName} ha sido cancelada${reasonText}. Lamentamos las molestias.`;
};

const formatReminder2h = (data) => {
    const { customerName, date, time, businessName = DEFAULT_BUSINESS } = data;
    return `Estimado/a ${customerName}, le recordamos su reserva #${data.id || ''} en ${businessName} para hoy a las ${time}. Le esperamos.`;
};

const formatPostVisitReview = (data) => {
    const { customerName, reviewLink, businessName = DEFAULT_BUSINESS } = data;
    return `Estimado/a ${customerName}, gracias por visitarnos en ${businessName}. Enlace para su opinión: ${reviewLink}`;
};

const formatAdminNotification = (data) => {
    const { id, date, time, guests, customerName, customerPhone, tableType, specialEvent } = data;
    return `NUEVA RESERVA (#${id})
Cliente: ${customerName} (${customerPhone})
Fecha: ${date} | Hora: ${time} | Pax: ${guests}
Zona: ${tableType || 'Estándar'}
Estado: Pendiente`;
};

module.exports = {
    formatReminder2h,
    formatPostVisitReview,
    formatCancellation,
    formatClientReceived,
    formatClientConfirmation,
    formatAdminNotification
};
