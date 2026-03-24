import { useState, useEffect } from 'react';
import { Typography, Box, Paper, TextField, Button, Grid, Alert, IconButton, CircularProgress } from '@mui/material';
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
      
      setConfig({
        ...data,
        restaurant: data.restaurant || { name: 'Hotaru Madrid', address: 'Calle de Alcalá 99' },
        minGuests: data.minGuests || 1,
        maxGuests: data.maxGuests || 10,
        totalCapacity: data.totalCapacity || 40
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



  if (loading || !config) {
    return <Box p={4}><CircularProgress /></Box>;
  }



  return (
    <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {savedMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {savedMsg}
        </Alert>
      )}

      {/* Restaurant Details Card */}
      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>
          Restaurant Details
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>
          Estos detalles son visibles para los clientes.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', mb: '24px' }}>
          <TextField
            label="Nombre del restaurante"
            variant="outlined"
            value={config.restaurant?.name || ''}
            onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, name: e.target.value } })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Dirección"
            variant="outlined"
            value={config.restaurant?.address || ''}
            onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, address: e.target.value } })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleSaveAll(false)}
            disabled={savingSettings}
            sx={{ 
              height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingSettings ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR DETALLES'}
          </Button>
        </Box>
      </Paper>

      {/* Reservation Rules Card */}
      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>
          Reservation Rules
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>
          Configura límites generales para reservaciones públicas.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', mb: '24px' }}>
          <TextField
            label="Mínimo de personas"
            type="number"
            variant="outlined"
            value={config.minGuests}
            onChange={(e) => setConfig({ ...config, minGuests: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Máximo de personas"
            type="number"
            variant="outlined"
            value={config.maxGuests}
            onChange={(e) => setConfig({ ...config, maxGuests: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleSaveAll(false)}
            disabled={savingSettings}
            sx={{ 
              height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingSettings ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR REGLAS'}
          </Button>
        </Box>
      </Paper>

      {/* Capacidad Total Card */}
      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>
          Capacidad Total
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '24px' }}>
          Número máximo de personas que el restaurante puede atender simultáneamente.
        </Typography>

        <Box sx={{ display: 'flex', gap: '16px', mb: '24px' }}>
          <TextField
            label="Capacidad de personas"
            type="number"
            variant="outlined"
            value={config.totalCapacity}
            onChange={(e) => setConfig({ ...config, totalCapacity: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            sx={{ maxWidth: 200 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleSaveAll(true)}
            disabled={savingCap}
            sx={{ 
              height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingCap ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR CAPACIDAD'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
