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
    date, guests, selectedSlot, selectedTableType, config 
  } = useReservationStore();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSpecialEvents()
      .then(res => {
        if (active) {
          const activeEvents = res.filter(e => e.is_active);
          setEvents(activeEvents);
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
  }, [setSelectedSpecialEvent, selectedSpecialEvent]);

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

      <Box sx={{ p: { xs: 2, sm: 4 }, flexGrow: 1 }}>
        <Typography sx={{ mt: 1, mb: 4, fontSize: '14px', color: '#70757A', fontFamily: 'Roboto' }}>
          ¿Alguna ocasión especial?
        </Typography>

        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
             <span className="material-icons" style={{ fontSize: 48, color: '#BDBDBD' }}>celebration</span>
             <Typography sx={{ mt: 2, color: '#70757A' }}>No hay eventos disponibles</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {events.map((event) => {
              const isSelected = selectedSpecialEvent?.id === event.id;
              return (
                <Paper
                  key={event.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    borderRadius: '4px',
                    border: isSelected ? '2px solid #1A73E8' : '1px solid #DADCE0',
                    bgcolor: isSelected ? '#E8F0FE' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': !isSelected ? {
                      bgcolor: '#F8F9FA',
                      borderColor: '#1A73E8'
                    } : {}
                  }}
                >
                  <ListItemButton 
                    onClick={() => setSelectedSpecialEvent(event)}
                    sx={{ p: '16px', display: 'flex', alignItems: 'flex-start' }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ 
                        fontWeight: 500, fontSize: '15px', 
                        color: isSelected ? '#1A73E8' : '#202124',
                        fontFamily: 'Roboto'
                      }}>
                        {event.name}
                      </Typography>
                      {event.description && (
                        <Typography sx={{ 
                          mt: '4px', fontSize: '14px', 
                          color: isSelected ? '#1565C0' : '#70757A',
                          fontFamily: 'Roboto'
                        }}>
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                    {isSelected && (
                      <span className="material-icons" style={{ color: '#1A73E8', fontSize: 20 }}>check_circle</span>
                    )}
                  </ListItemButton>
                </Paper>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer Continue Button */}
      <Box sx={{ mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!selectedSpecialEvent}
          onClick={onContinue}
          disableElevation
          sx={{
            height: 56,
            borderRadius: 0,
            bgcolor: '#1A73E8',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '15px',
            textTransform: 'uppercase',
            fontFamily: 'Roboto',
            '&.Mui-disabled': {
              bgcolor: '#E0E0E0',
              color: '#BDBDBD'
            },
            '&:hover': {
              bgcolor: '#1557B0'
            }
          }}
        >
          CONTINUAR
        </Button>
      </Box>
    </Box>
  );
}
