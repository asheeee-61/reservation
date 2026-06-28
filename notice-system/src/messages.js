/**
 * Message templates for WhatsApp notifications
 * Rules: Professional formal Spanish, no emojis.
 * restaurantName is passed from the backend payload dynamically.
 */

const DEFAULT_BUSINESS = process.env.BUSINESS_NAME || 'Business';

const formatClientReceived = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent, businessName = DEFAULT_BUSINESS, address } = data;
    const ref = id ? `\n\nReferencia: #${id}` : '';
    const addressText = address ? `\nDirección: ${address}` : '';
    return `SOLICITUD DE RESERVA RECIBIDA - ${businessName}

Estimado/a ${customerName}, hemos recibido su solicitud de reserva.

Detalles:
- Fecha: ${date}
- Hora: ${time}
- Personas: ${guests}
- Zona: ${tableType || 'Estándar'}
- Evento: ${specialEvent || 'Ninguno'}${addressText}${ref}

Nos pondremos en contacto con usted para confirmarla. Muchas gracias.`;
};

const formatClientConfirmation = (data) => {
    const { id, customerName, businessName = DEFAULT_BUSINESS, address, date, time, guests } = data;
    const ref = id ? ` #${id}` : '';
    const addressText = address ? `\nDirección: ${address}` : '';
    const details = (date && time) ? `\n\nDetalles:\n- Fecha: ${date}\n- Hora: ${time}${guests ? `\n- Personas: ${guests}` : ''}${addressText}` : '';
    return `Estimado/a ${customerName}, le informamos que su reserva${ref} en ${businessName} ha sido CONFIRMADA.${details}\n\nLe esperamos.`;
};

const formatCancellation = (data) => {
    const { id, customerName, reason, businessName = DEFAULT_BUSINESS } = data;
    const ref = id ? ` #${id}` : '';
    const reasonText = reason ? ` por el siguiente motivo: ${reason}` : '';
    return `Estimado/a ${customerName}, le informamos que su reserva${ref} en ${businessName} ha sido cancelada${reasonText}. Lamentamos las molestias.`;
};

const formatReminder2h = (data) => {
    const { id, customerName, date, time, businessName = DEFAULT_BUSINESS, address } = data;
    const ref = id ? ` #${id}` : '';
    const addressText = address ? ` (${address})` : '';
    return `Estimado/a ${customerName}, le recordamos su reserva${ref} en ${businessName}${addressText} para hoy a las ${time}. Le esperamos.`;
};

module.exports = {
    formatReminder2h,
    formatCancellation,
    formatClientReceived,
    formatClientConfirmation
};
