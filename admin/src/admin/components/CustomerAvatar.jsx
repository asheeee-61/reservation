import React, { useMemo } from 'react';
import { calculateCredibility, calculateFromReservations } from '../utils/credibility';
import './CustomerAvatar.css';

/**
 * Reusable customer avatar with credibility badge
 * 
 * Props:
 *   name        {string}  - customer name
 *   reservations {array}  - full reservations array OR
 *   counts      {object}  - { total, arrived, confirmed, cancelled, noShow }
 *   size        {number}  - avatar size in px (default 36)
 *   showTooltip {boolean} - show label on hover (default true)
 *   onClick     {function} - manual click handler
 */
export default function CustomerAvatar({ 
  name, 
  reservations, 
  counts, 
  size = 36, 
  showTooltip = true,
  onClick
}) {
  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const credibility = useMemo(() => {
    if (reservations) return calculateFromReservations(reservations);
    if (counts) return calculateCredibility(counts);
    
    // Default fallback (no data provided)
    return { tier: 'unknown', color: '#BDBDBD', label: 'Sin historial' };
  }, [reservations, counts]);

  // Dot size is roughly 28% of the avatar size per MD2 spec
  const dotSize = Math.max(8, Math.round(size * 0.28));
  const dotPosition = Math.floor(size * 0.05);

  return (
    <div 
      className="customer-avatar-wrapper"
      onClick={onClick}
      style={{ 
        width: size, 
        height: size, 
        fontSize: Math.max(12, Math.round(size * 0.4)),
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: '#F1F3F4' // MD2 Light Grey
      }}
      data-tooltip={showTooltip ? (name ? `${name} · ${credibility.label}` : credibility.label) : null}
    >
      {initials}
      <div 
        className="credibility-dot"
        style={{ 
          width: dotSize, 
          height: dotSize, 
          backgroundColor: credibility.color,
          bottom: dotPosition,
          right: dotPosition
        }}
      />
    </div>
  );
}
