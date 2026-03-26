import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, CircularProgress, 
  Paper, Radio, RadioGroup, FormControlLabel, FormControl,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  IconButton
} from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';
import { getTableTypes } from '../services/reservationService';

export default function TableTypeSelection({ onBack, onContinue }) {
  const { 
    selectedTableType, setSelectedTableType, config,
    tableTypes: cachedTypes, setTableTypes: setCachedTypes
  } = useReservationStore();
  const [loading, setLoading] = useState(!cachedTypes);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    if (cachedTypes) return;
    
    setLoading(true);
    getTableTypes().then(types => {
      const activeTypes = types.filter(t => t.is_active);
      setCachedTypes(activeTypes);
      setLoading(false);
      
      // Auto-select first if none selected
      if (activeTypes.length > 0 && !selectedTableType) {
        setSelectedTableType(activeTypes[0]);
      }
    });
  }, [cachedTypes, setCachedTypes, setSelectedTableType, selectedTableType]);

  if (loading && !cachedTypes) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
        <CircularProgress />
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
          Selecciona tipo de mesa
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: '20px', color: '#202124' }}>
          ¿Qué tipo de mesa prefiere?
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#70757A', fontSize: '14px' }}>
          Seleccione una de las siguientes opciones:
        </Typography>

        <Box sx={{ width: '100%' }}>
          {(cachedTypes || []).map((type) => {
            const isSelected = selectedTableType?.id === type.id;
            return (
              <Paper 
                key={type.id} 
                elevation={0}
                onClick={() => {
                  setSelectedTableType(type);
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
                  <span className="material-icons" style={{ fontSize: 24 }}>table_restaurant</span>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight={isSelected ? 600 : 500} sx={{ color: '#202124', fontSize: '16px' }}>
                    {type.name}
                  </Typography>
                  {type.description && (
                    <Typography variant="body2" sx={{ color: '#70757A', display: 'block', mt: 0.5, fontSize: '13px' }}>
                      {type.description}
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
        <Button
          fullWidth
          variant="contained"
          disabled={!selectedTableType || continuing}
          onClick={onContinue}
          sx={{ 
            height: 56, borderRadius: '4px', bgcolor: '#1A73E8', color: '#FFFFFF',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1.25px',
            boxShadow: 'none', '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: '#F1F3F4', color: '#BDBDBD' }
          }}
        >
          {continuing ? <CircularProgress size={24} color="inherit" /> : 'CONTINUAR'}
        </Button>
      </Box>
    </Box>
  );
}
