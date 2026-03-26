import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, Typography, MenuItem, Select, FormControl,
  InputAdornment, Button, Grid, CircularProgress, Divider, Skeleton
} from '@mui/material';

import { useReservationStore } from '../store/useReservationStore';
import { getAvailableSlots } from '../services/reservationService';

const formatDateLabel = (dateString) => {
  if (!dateString) return '';
  const selectedDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  if (selectedDate.toDateString() === today.toDateString()) return "Hoy";
  if (selectedDate.toDateString() === tomorrow.toDateString()) return "Mañana";
  
  return selectedDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function LeftPanel({ onContinue }) {
  const { date, guests, selectedSlot, config, setDate, setGuests, setSelectedSlot } = useReservationStore();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const dateInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (!config) return;
    
    setLoading(true);
    getAvailableSlots(date, guests)
      .then(res => {
        if (active) {
          setSlots(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [date, guests, config]);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  if (!config) return <Box p={4}><CircularProgress /></Box>;
  
  const guestsOptions = [];
  for (let i = config.minGuests; i <= config.maxGuests; i++) guestsOptions.push(i);

  return (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', 
      height: '100%',
      bgcolor: '#FFFFFF',
      borderRight: '1px solid #E0E0E0',
      zIndex: 1,
      overflowY: 'auto'
    }}>
      <Box sx={{ 
        display: 'flex', alignItems: 'center', 
        height: 56, px: { xs: 2, sm: 4 }, 
        borderBottom: '1px solid #E0E0E0'
      }}>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {config.restaurant.name}
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 } }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 2, color: '#70757A', fontSize: '14px' }}>
            {config.restaurant.address}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#202124', fontSize: '15px', fontWeight: 500 }}>
            Elija el número de personas, la fecha y la hora.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%' } }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, fontSize: '14px', color: '#70757A' }}>
              Personas
            </Typography>
            <FormControl fullWidth>
              <Select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                IconComponent={(props) => <span {...props} className={"material-icons " + props.className} style={{ color: '#70757A' }}>arrow_drop_down</span>}
                sx={{ 
                  height: 48,
                  borderRadius: '4px',
                  bgcolor: '#FFFFFF',
                  color: '#202124',
                  fontSize: '16px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0', borderWidth: '1px' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1A73E8', borderWidth: '2px' }
                }}
              >
                {guestsOptions.map(num => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%' }, position: 'relative' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, fontSize: '14px', color: '#70757A' }}>
              Fecha
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDateClick}
              endIcon={<span className="material-icons" style={{ color: '#70757A' }}>arrow_drop_down</span>}
              sx={{ 
                width: '100%', 
                height: 48,
                justifyContent: 'space-between',
                borderColor: '#DADCE0',
                color: '#202124',
                bgcolor: '#FFFFFF',
                borderRadius: '4px',
                py: 0,
                px: 3,
                fontSize: '16px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#DADCE0',
                  bgcolor: '#FFFFFF',
                },
                '&:focus': {
                  borderColor: '#1A73E8',
                  borderWidth: '2px',
                }
              }}
            >
              {formatDateLabel(date)}
            </Button>
            <input 
              type="date"
              ref={dateInputRef}
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, border: 0, padding: 0, overflow: 'hidden' }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 0, borderColor: '#E0E0E0' }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, fontSize: '14px', color: '#70757A' }}>
            Horarios Disponibles
          </Typography>
          {date && (
            <Typography sx={{ mb: 3, fontSize: '12px', fontWeight: 500, color: '#70757A', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
            </Typography>
          )}

        {(() => {
          if (loading) {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} sx={{ color: '#1A73E8' }} />
              </Box>
            );
          }

          if (!date) {
            return <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">Por favor, seleccione una fecha para ver los horarios disponibles.</Typography>;
          }

          const isBlocked = config.blockedDays && config.blockedDays.includes(date);
          
          if (isBlocked) {
             return (
               <Box sx={{ p: 2, bgcolor: '#FDECEA', color: '#D93025', display: 'flex', alignItems: 'center', borderRadius: '4px', mt: 2 }}>
                 <span className="material-icons" style={{ marginRight: 8 }}>error</span>
                 <Typography variant="body2" fontWeight={500}>No disponible este día</Typography>
               </Box>
             );
          }

          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayName = days[new Date(date).getDay()];
          const dayConfig = config.schedule?.[dayName] || { open: true, slots: {} };
          
          if (!dayConfig.open) {
             return <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">Restaurante cerrado este día.</Typography>;
          }

          let masterSlots = {};
          if (dayConfig.shifts && Array.isArray(dayConfig.shifts)) {
            dayConfig.shifts.forEach(shift => {
              if (shift.slots) Object.assign(masterSlots, shift.slots);
            });
          } else if (dayConfig.slots) {
            masterSlots = dayConfig.slots;
          }

          // Filter out slots that admin specifically closed
          const visibleSlots = slots.filter(slot => masterSlots[slot.time] !== false);

          if (visibleSlots.length === 0) {
            return <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">No hay horarios disponibles para esta fecha.</Typography>;
          }

          const todayObj = new Date();
          const todayStr = todayObj.toDateString();
          const selectedDateStr = new Date(date).toDateString();
          const isToday = todayStr === selectedDateStr;
          
          const currentHour = todayObj.getHours().toString().padStart(2, '0');
          const currentMin = todayObj.getMinutes().toString().padStart(2, '0');
          const currentTimeString = `${currentHour}:${currentMin}`;

          return (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {visibleSlots.map((slot, sIdx) => {
                const isSelected = selectedSlot?.time === slot.time;
                const isPast = isToday && slot.time <= currentTimeString;
                const isFull = !slot.available || isPast;
                return (
                  <Grid size={{ xs: 4, sm: 3, md: 4, lg: 3 }} key={sIdx}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Button
                        fullWidth
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "primary" : "inherit"}
                        disabled={isFull}
                        onClick={() => {
                          setSelectedSlot({ time: slot.time });
                          // Auto-advance
                          setTimeout(() => onContinue(), 150);
                        }}
                        sx={{ 
                          height: 48,
                          minWidth: 72,
                          borderRadius: '4px',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '16px',
                          p: 0,
                          ...(isSelected ? {
                            border: '2px solid #1A73E8',
                            bgcolor: '#E8F0FE',
                            color: '#1A73E8',
                            '&:hover': { bgcolor: '#E8F0FE', border: '2px solid #1A73E8' }
                          } : !isFull ? {
                            border: '1px solid #1A73E8',
                            bgcolor: '#FFFFFF',
                            color: '#1A73E8',
                            '&:hover': { bgcolor: '#E8F0FE', border: '1px solid #1A73E8' }
                          } : {
                            border: '1px solid #E0E0E0',
                            bgcolor: '#F1F3F4',
                            color: '#BDBDBD',
                          }),
                          '&.Mui-disabled': {
                            border: '1px solid #E0E0E0',
                            bgcolor: '#F1F3F4',
                            color: '#BDBDBD',
                          }
                        }}
                      >
                        {slot.time}
                      </Button>

                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          );
        })()}
        </Box>

        {/* Manual continue button removed for simpler auto-advance flow */}
      </Box>
    </Box>
  );
}
