import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, 
  Paper, Radio, RadioGroup, FormControlLabel, FormControl,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  IconButton
} from '@mui/material';
import { PageHeaderSkeleton, CardSkeleton } from '../../admin/components/Skeletons';
import { useReservationStore } from '../store/useReservationStore';
import { getZones } from '../services/reservationService';

export default function ZoneSelection({ onBack, onAutoAdvance }) {
  const { 
    selectedZone, setSelectedZone, 
    date, guests, selectedSlot, config,
    zones: cachedZones, setZones: setCachedZones
  } = useReservationStore();
  const [loading, setLoading] = useState(!cachedZones);

  useEffect(() => {
    if (cachedZones) return;
    
    setLoading(true);
    getZones().then(zones => {
      const activeZones = zones.filter(t => t.is_active);
      setCachedZones(activeZones);
      setLoading(false);
      
      // Auto-select first if none selected
      if (activeZones.length > 0 && !selectedZone) {
        setSelectedZone(activeZones[0]);
      }
    });
  }, [cachedZones, setCachedZones, setSelectedZone, selectedZone]);

  if (loading && !cachedZones) {
    return (
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <PageHeaderSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </Box>
    );
  }

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
        height: 56, px: { xs: 1, sm: 2 }, 
        borderBottom: '1px solid #E0E0E0'
      }}>
        <IconButton onClick={onBack} sx={{ color: '#70757A', width: 48, height: 48 }}>
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Typography sx={{ flexGrow: 1, mr: 5, textAlign: 'center', fontWeight: 500, fontSize: '16px', color: '#202124', fontFamily: 'Roboto' }}>
          Selecciona zona
        </Typography>
      </Box>

      {/* Summary line */}
      <Box sx={{ bgcolor: '#F1F3F4', p: '12px', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '14px', color: '#70757A', fontFamily: 'Roboto', fontWeight: 400 }}>
          {`${guests} personas  ·  ${date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}  ·  ${selectedSlot?.time}`}
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: '20px', color: '#202124' }}>
          ¿Qué zona prefiere?
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#70757A', fontSize: '14px' }}>
          Seleccione una de las siguientes opciones:
        </Typography>

        <Box sx={{ width: '100%' }}>
          {(cachedZones || []).map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            return (
              <Paper 
                key={zone.id} 
                elevation={0}
                onClick={() => {
                  setSelectedZone(zone);
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
                  <span className="material-icons" style={{ fontSize: 24 }}>map</span>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight={isSelected ? 600 : 500} sx={{ color: '#202124', fontSize: '16px' }}>
                    {zone.name}
                  </Typography>
                  {zone.description && (
                    <Typography variant="body2" sx={{ color: '#70757A', display: 'block', mt: 0.5, fontSize: '13px' }}>
                      {zone.description}
                    </Typography>
                  )}
                </Box>
                {isSelected && (
                  <span className="material-icons" style={{ color: '#1A73E8', fontSize: 20 }}>check_circle</span>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mt: 'auto', p: { xs: 3, sm: 4 }, pt: 0 }}>
        {/* Auto-advance triggers on selection */}
      </Box>
    </Box>
  );
}
