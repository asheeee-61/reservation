/**
 * Message templates for WhatsApp notifications
 * Rules: Professional formal Spanish, no emojis.
 * restaurantName is passed from the backend payload dynamically.
 */

const DEFAULT_RESTAURANT = process.env.RESTAURANT_NAME || 'Hotaru Madrid';

const formatReminder2h = (data) => {
    const { customerName, date, time, restaurantName = DEFAULT_RESTAURANT } = data;
    return `Estimado/a ${customerName}, le recordamos su reserva en ${restaurantName} para hoy ${date} a las ${time}. Le esperamos.`;
};

const formatPostVisitReview = (data) => {
    const { customerName, reviewLink, restaurantName = DEFAULT_RESTAURANT } = data;
    return `Estimado/a ${customerName}, gracias por visitarnos en ${restaurantName}. Nos encantaría conocer su opinión sobre su experiencia: ${reviewLink}`;
};

const formatCancellation = (data) => {
    const { customerName, reason, restaurantName = DEFAULT_RESTAURANT } = data;
    if (reason) {
        return `Estimado/a ${customerName}, le informamos que su reserva en ${restaurantName} ha sido cancelada por el siguiente motivo: ${reason}. Lamentamos las molestias.`;
    }
    return `Estimado/a ${customerName}, le informamos que su reserva en ${restaurantName} ha sido cancelada. Lamentamos las molestias.`;
};

const formatClientConfirmation = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent, restaurantName = DEFAULT_RESTAURANT } = data;
    return `Estimado/a ${customerName}, hemos recibido su reserva en ${restaurantName}.
Fecha: ${date}
Hora: ${time}
Personas: ${guests}
Zona: ${tableType || 'Estándar'}
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
Zona: ${tableType || 'Estándar'}
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
