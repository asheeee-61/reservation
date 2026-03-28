/**
 * Message templates for WhatsApp notifications
 * Rules: Professional formal Spanish, no emojis.
 */

const formatReminder2h = (data) => {
    const { customerName, date, time } = data;
    return `Estimado/a ${customerName}, le recordamos su reserva en Hotaru Madrid para hoy ${date} a las ${time}. Le esperamos.`;
};

const formatPostVisitReview = (data) => {
    const { customerName, reviewLink } = data;
    return `Estimado/a ${customerName}, gracias por visitarnos en Hotaru Madrid. Nos encantaría conocer su opinión sobre su experiencia: ${reviewLink}`;
};

const formatCancellation = (data) => {
    const { customerName, reason } = data;
    if (reason) {
        return `Estimado/a ${customerName}, le informamos que su reserva en Hotaru Madrid ha sido cancelada por el siguiente motivo: ${reason}. Lamentamos las molestias.`;
    }
    return `Estimado/a ${customerName}, le informamos que su reserva en Hotaru Madrid ha sido cancelada. Lamentamos las molestias.`;
};

// Existing templates refactored (no emojis)
const formatClientConfirmation = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent } = data;
    return `Estimado/a ${customerName}, hemos recibido su reserva en Hotaru Madrid.
Fecha: ${date}
Hora: ${time}
Personas: ${guests}
Mesa: ${tableType || 'Estándar'}
Evento: ${specialEvent || 'Ninguno'}
Referencia: #${id}
Le confirmaremos en breve. Muchas gracias.`;
};

const formatAdminNotification = (data) => {
    const { id, date, time, guests, customerName, customerPhone, tableType, specialEvent } = data;
    return `Nueva reserva recibida #${id}
Cliente: ${customerName} (${customerPhone})
Fecha: ${date}
Hora: ${time}
Pax: ${guests}
Mesa: ${tableType || 'Estándar'}
Evento: ${specialEvent || 'Ninguno'}
Estado: Pendiente de confirmación`;
};

module.exports = {
    formatReminder2h,
    formatPostVisitReview,
    formatCancellation,
    formatClientConfirmation,
    formatAdminNotification
};
