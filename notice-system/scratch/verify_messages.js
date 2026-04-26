const { 
    formatReminder2h, 
    formatPostVisitReview, 
    formatCancellation,
    formatClientReceived,
    formatClientConfirmation
} = require('../src/messages');

const data = {
    id: '12345',
    customerName: 'Juan Pérez',
    date: '28/03/2026',
    time: '21:00',
    guests: 4,
    businessName: 'Hechizo Hookah Lounge',
    reviewLink: 'https://g.page/r/hechizo/review',
    reason: 'Falta de aforo'
};

console.log('--- Client Received ---');
console.log(formatClientReceived(data));
console.log('\n--- Client Confirmation ---');
console.log(formatClientConfirmation(data));
console.log('\n--- Cancellation ---');
console.log(formatCancellation(data));
console.log('\n--- Reminder 2h ---');
console.log(formatReminder2h(data));
console.log('\n--- Post Visit Review ---');
console.log(formatPostVisitReview(data));

const dataNoId = {
    customerName: 'Juan Pérez',
    date: '28/03/2026',
    time: '21:00',
    guests: 4,
    businessName: 'Hechizo Hookah Lounge',
    reviewLink: 'https://g.page/r/hechizo/review'
};

console.log('\n--- Reminder 2h (No ID) ---');
console.log(formatReminder2h(dataNoId));
