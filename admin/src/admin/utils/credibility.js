/**
 * Calculates customer credibility based on reservation history.
 * 
 * @param {Object} counts - Object containing total, arrived, and noShow counts.
 * @returns {Object} { tier, color, label }
 */
export function calculateCredibility(counts) {
  const { total = 0, arrived = 0, noShow = 0 } = counts;

  // Tier 0: New Customer
  if (total === 0) {
    return { tier: 'new', color: '#BDBDBD', label: 'Nuevo cliente' };
  }

  // Tier Ongoing/One: No attendance history yet (all pending/confirmed/cancelled)
  if (arrived === 0 && noShow === 0) {
    if (total === 1) {
      return { tier: 'one', color: '#BDBDBD', label: '1 reserva' };
    }
    return { tier: 'ongoing', color: '#64B5F6', label: 'Sin historial de asistencia' };
  }

  // Attendance history exists (arrived + noShow > 0)
  const attendanceSum = arrived + noShow;
  const percentage = Math.round((arrived / attendanceSum) * 100);

  if (percentage >= 85) {
    return { tier: 'reliable', color: '#4CAF50', label: `Fiable · ${percentage}%` };
  }
  if (percentage >= 65) {
    return { tier: 'good', color: '#FFC107', label: `Bueno · ${percentage}%` };
  }
  if (percentage >= 40) {
    return { tier: 'irregular', color: '#FF9800', label: `Irregular · ${percentage}%` };
  }
  return { tier: 'unreliable', color: '#F44336', label: `Poco fiable · ${percentage}%` };
}

/**
 * Calculates credibility from an array of reservation objects.
 * 
 * @param {Array} reservations - Array of reservation objects.
 * @returns {Object} { tier, color, label }
 */
export function calculateFromReservations(reservations) {
  if (!reservations || !Array.isArray(reservations)) {
    return calculateCredibility({ total: 0, arrived: 0, noShow: 0 });
  }

  const counts = {
    total: reservations.length,
    arrived: reservations.filter(r => r.status === 'ASISTIÓ').length,
    noShow: reservations.filter(r => r.status === 'NO_ASISTIÓ').length,
  };
  
  return calculateCredibility(counts);
}
