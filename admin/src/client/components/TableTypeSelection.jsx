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
  const { selectedTableType, setSelectedTableType, config } = useReservationStore();
  const [tableTypes, setTableTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTableTypes().then(types => {
      setTableTypes(types.filter(t => t.is_active));
      setLoading(false);
      // Auto-select first if none selected
      if (types.length > 0 && !selectedTableType) {
        setSelectedTableType(types[0]);
      }
    });
  }, [setSelectedTableType, selectedTableType]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
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

      <Box sx={{ p: { xs: 2, sm: 4 }, flexGrow: 1 }}>
        <Typography variant="body2" sx={{ mb: 4, color: '#70757A' }}>
          Elige dónde prefieres disfrutar de tu experiencia en {config?.restaurant?.name || 'nuestro restaurante'}.
        </Typography>

        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {tableTypes.map((type) => {
            const isSelected = selectedTableType?.id === type.id;
            return (
              <Paper 
                key={type.id} 
                elevation={0}
                sx={{ 
                  mb: 2, 
                  border: isSelected ? '2px solid #1A73E8' : '1px solid #DADCE0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  bgcolor: isSelected ? '#E8F0FE' : '#FFFFFF',
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemButton 
                  onClick={() => {
                    setSelectedTableType(type);
                    setTimeout(() => onContinue(), 150);
                  }}
                  sx={{ p: 3, alignItems: 'flex-start' }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <Radio
                      checked={isSelected}
                      value={type.id}
                      sx={{ p: 0, color: isSelected ? '#1A73E8' : '#70757A' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 500, fontSize: '16px', color: '#202124' }}>
                        {type.name}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ mt: 0.5, fontSize: '14px', color: '#70757A' }}>
                        {type.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Paper>
            );
          })}
        </List>
      </Box>

      {/* Manual continue button removed for simpler auto-advance flow */}
    </Box>
  );
}
