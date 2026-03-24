import { useState, useEffect } from 'react';
import { Typography, Box, Paper, TextField, Button, Grid, Divider, Alert, IconButton, CircularProgress } from '@mui/material';
import { apiClient } from '../services/apiClient';

const DEFAULT_SLOTS = ["13:00", "13:30", "14:00", "14:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCap, setSavingCap] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await apiClient('/config');
      
      const capacity = data.capacity || {};
      DEFAULT_SLOTS.forEach(time => {
         if (capacity[time] === undefined) capacity[time] = 20;
      });

      setConfig({
        ...data,
        restaurant: data.restaurant || { name: 'Hotaru Madrid', address: 'Calle de Alcalá 99' },
        minGuests: data.minGuests || 1,
        maxGuests: data.maxGuests || 10,
        capacity
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSaveAll = async (isCap = false) => {
    if (isCap) setSavingCap(true);
    else setSavingSettings(true);
    
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      setSavedMsg(isCap ? "Capacidades guardadas exitosamente." : "Detalles guardados exitosamente.");
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setSavingCap(false);
      setSavingSettings(false);
    }
  };

  const updateCapacity = (time, delta) => {
    setConfig(prev => {
      const current = prev.capacity[time] || 1;
      let next = current + delta;
      if (next < 1) next = 1;
      if (next > 999) next = 999;
      return {
        ...prev,
        capacity: { ...prev.capacity, [time]: next }
      };
    });
  };

  const handleCapacityChange = (time, value) => {
    let next = parseInt(value, 10);
    if (isNaN(next)) return;
    if (next < 1) next = 1;
    if (next > 999) next = 999;
    setConfig(prev => ({
      ...prev,
      capacity: { ...prev.capacity, [time]: next }
    }));
  };

  if (loading || !config) {
    return <Box p={4}><CircularProgress /></Box>;
  }

  const allSlots = Object.keys(config.capacity).sort();

  return (
    <Box sx={{ pb: 8, maxWidth: 800 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Ajustes del Sistema
      </Typography>
      
      {savedMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {savedMsg}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography variant="h6" gutterBottom>
          Detalles del Restaurante
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Estos detalles son visibles para los clientes.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth label="Nombre del restaurante"
              value={config.restaurant?.name || ''}
              onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, name: e.target.value } })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth label="Dirección"
              value={config.restaurant?.address || ''}
              onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, address: e.target.value } })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth label="Mínimo de personas"
              type="number"
              value={config.minGuests}
              onChange={(e) => setConfig({ ...config, minGuests: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth label="Máximo de personas"
              type="number"
              value={config.maxGuests}
              onChange={(e) => setConfig({ ...config, maxGuests: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleSaveAll(false)}
            disabled={savingSettings}
            sx={{ px: 4, height: 48, bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px' }}
          >
            {savingSettings ? <CircularProgress size={24} color="inherit" /> : 'GUARDAR DETALLES'}
          </Button>
        </Box>
      </Paper>

      {/* Capacidad por slot */}
      <Paper sx={{ p: 4, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography variant="h6" gutterBottom>
          Capacidad por slot
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configura la capacidad máxima de personas permitidas para cada franja horaria.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}>
          {allSlots.map(time => (
            <Box key={time} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E0E0E0' }}>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#202124' }}>{time}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => updateCapacity(time, -1)}
                  sx={{ width: 28, height: 28, border: '1px solid #70757A', borderRadius: '4px' }}
                >
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>remove</span>
                </IconButton>
                
                <input 
                  type="text" 
                  value={config.capacity[time]}
                  onChange={(e) => handleCapacityChange(time, e.target.value)}
                  style={{ 
                    width: 48, 
                    height: 28, 
                    textAlign: 'center', 
                    fontFamily: 'Roboto', 
                    fontWeight: 500, 
                    fontSize: '14px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    color: '#202124'
                  }} 
                />

                <IconButton 
                  size="small" 
                  onClick={() => updateCapacity(time, 1)}
                  sx={{ width: 28, height: 28, border: '1px solid #70757A', borderRadius: '4px' }}
                >
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>add</span>
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
          <Button 
            variant="contained" 
            onClick={() => handleSaveAll(true)}
            disabled={savingCap}
            sx={{ height: 48, px: 4, bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px' }}
          >
            {savingCap ? <CircularProgress size={24} color="inherit" /> : 'GUARDAR CAPACIDADES'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
