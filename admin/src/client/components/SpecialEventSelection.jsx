import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, CircularProgress, 
  Paper, Radio, List, ListItemButton, 
  ListItemText, ListItemIcon, Skeleton,
  IconButton
} from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';
import { getSpecialEvents } from '../services/reservationService';

export default function SpecialEventSelection({ onBack, onContinue }) {
  const { 
    selectedSpecialEvent, setSelectedSpecialEvent, 
    date, guests, selectedSlot, selectedTableType, config,
    specialEvents: cachedEvents, setSpecialEvents: setCachedEvents
  } = useReservationStore();
  
  const [loading, setLoading] = useState(!cachedEvents);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedEvents) return;

    let active = true;
    setLoading(true);
    getSpecialEvents()
      .then(res => {
        if (active) {
          const activeEvents = res.filter(e => e.is_active);
          setCachedEvents(activeEvents);
          // Auto-select first if none selected
          if (activeEvents.length > 0 && !selectedSpecialEvent) {
             setSelectedSpecialEvent(activeEvents[0]);
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
  }, [cachedEvents, setCachedEvents, setSelectedSpecialEvent, selectedSpecialEvent]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFFFF',
        borderRight: '1px solid #E0E0E0'
      }}>
        <Box sx={{ height: 56, display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid #E0E0E0' }}>
           <Skeleton width="100%" height={32} />
        </Box>
        <Box sx={{ p: 4 }}>
          {[1,2,3].map(i => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '4px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
     return (
       <Box sx={{ p: 4, textAlign: 'center' }}>
         <span className="material-icons" style={{ fontSize: 48, color: '#D93025', marginBottom: 16 }}>error</span>
         <Typography variant="body1" gutterBottom>Error al cargar eventos</Typography>
         <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>REINTENTAR</Button>
       </Box>
     );
  }

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const summaryText = `${guests} personas  ·  ${formatDateShort(date)}  ·  ${selectedSlot?.time}  ·  ${selectedTableType?.name}`;

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
          Ocasión especial
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
          ¿Alguna ocasión especial?
        </Typography>

        {(!cachedEvents || cachedEvents.length === 0) ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
             <span className="material-icons" style={{ fontSize: 48, color: '#BDBDBD' }}>celebration</span>
             <Typography sx={{ mt: 2, color: '#70757A' }}>No hay eventos disponibles</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {cachedEvents.map((event) => {
              const isSelected = selectedSpecialEvent?.id === event.id;
              return (
                <Paper
                  key={event.id}
                  elevation={0}
                  onClick={() => {
                    setSelectedSpecialEvent(event);
                    setTimeout(() => onContinue(), 150);
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

      {/* Footer Continue Button */}
      {/* Manual continue button removed for simpler auto-advance flow */}
    </Box>
  );
}
