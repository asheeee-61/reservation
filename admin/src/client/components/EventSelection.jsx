import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, 
  Paper, Radio, List, ListItemButton, 
  ListItemText, ListItemIcon, Skeleton,
  IconButton
} from '@mui/material';
import { PageHeaderSkeleton, CardSkeleton } from '../../admin/components/Skeletons';
import { ErrorState } from '../../admin/components/ErrorState';
import { useReservationStore } from '../store/useReservationStore';
import { getEvents } from '../services/reservationService';

export default function EventSelection({ onBack, onAutoAdvance }) {
  const { 
    selectedEvent, setSelectedEvent, 
    date, guests, selectedSlot, selectedZone, config,
    events: cachedEvents, setEvents: setCachedEvents
  } = useReservationStore();
  
  const [loading, setLoading] = useState(!cachedEvents);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedEvents) return;

    let active = true;
    setLoading(true);
    getEvents()
      .then(res => {
        if (active) {
          const activeEvents = res.filter(e => e.is_active);
          setCachedEvents(activeEvents);
          // Auto-select first if none selected
          if (activeEvents.length > 0 && !selectedEvent) {
             setSelectedEvent(activeEvents[0]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [cachedEvents, setCachedEvents, setSelectedEvent, selectedEvent]);

  if (loading && !cachedEvents) {
    return (
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <PageHeaderSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </Box>
    );
  }

  if (error) {
     return <ErrorState message="Error al cargar eventos" onRetry={() => window.location.reload()} />;
  }

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const summaryText = `${guests} personas  ·  ${formatDateShort(date)}  ·  ${selectedSlot?.time}  ·  ${selectedZone?.name}`;

  return (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', 
      height: '100%',
      bgcolor: '#FFFFFF',
      borderRight: '1px solid #E0E0E0',
      zIndex: 1,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', 
        height: 56, px: { xs: 1, sm: 2 }, 
        borderBottom: '1px solid #E0E0E0'
      }}>
        <IconButton onClick={onBack} sx={{ color: '#70757A', width: 48, height: 48 }}>
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Typography sx={{ flexGrow: 1, mr: 5, textAlign: 'center', fontWeight: 500, fontSize: '16px', color: '#202124', fontFamily: 'Roboto' }}>
          Evento
        </Typography>
      </Box>

      {/* Summary line */}
      <Box sx={{ bgcolor: '#F1F3F4', p: '12px', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '14px', color: '#70757A', fontFamily: 'Roboto', fontWeight: 400 }}>
          {summaryText}
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: '20px', color: '#202124' }}>
          ¿Alguna ocasión especial o evento?
        </Typography>

        {(!cachedEvents || cachedEvents.length === 0) ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
             <span className="material-icons" style={{ fontSize: 48, color: '#BDBDBD' }}>celebration</span>
             <Typography sx={{ mt: 2, color: '#70757A' }}>No hay eventos disponibles</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {cachedEvents.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              return (
                <Paper
                  key={event.id}
                  elevation={0}
                  onClick={() => {
                    setSelectedEvent(event);
                    onAutoAdvance();
                  }}
                  sx={{
                    mb: 2,
                    p: 3,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    border: isSelected ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                    bgcolor: isSelected ? '#E8F0FE' : '#FFFFFF',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{
                    mr: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48, height: 48,
                    borderRadius: '50%',
                    bgcolor: isSelected ? '#FFFFFF' : '#F1F3F4',
                    color: isSelected ? '#1A73E8' : '#70757A'
                  }}>
                    <span className="material-icons" style={{ fontSize: 24 }}>auto_awesome</span>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={isSelected ? 600 : 500} sx={{ color: '#202124', fontSize: '16px' }}>
                      {event.name}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" sx={{ color: '#70757A', display: 'block', mt: 0.5, fontSize: '13px' }}>
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                  {isSelected && (
                    <span className="material-icons" style={{ color: '#1A73E8', fontSize: 20 }}>check_circle</span>
                  )}
                </Paper>
              );
            })}
          </List>
        )}
      </Box>

      <Box sx={{ mt: 'auto', p: { xs: 3, sm: 4 }, pt: 0 }}>
        {/* Auto-advance triggers on selection */}
      </Box>
    </Box>
  );
}
