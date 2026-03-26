import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, TextField, Button, Dialog, Alert, 
  CircularProgress, Select, MenuItem, FormControl,
  DialogContent, DialogActions 
} from '@mui/material';
import { useSettingsStore } from '../store/useSettingsStore';
import { apiClient } from '../services/apiClient';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';

const INTERVAL_OPTIONS = [15, 30, 45, 60, 90, 120];
const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`);
    opts.push(`${String(h).padStart(2, '0')}:30`);
  }
  return opts;
})();
const DAY_LABELS = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };

export default function Settings() {
  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCap, setSavingCap] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const globalHours = useSettingsStore(state => state.globalHours);
  
  const [localGlobal, setLocalGlobal] = useState({ openingTime: '09:00', closingTime: '00:00', defaultInterval: 30 });
  const [localContact, setLocalContact] = useState({ whatsappPhone: '', instagramUsername: '' });
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    fetchGlobalHours();
  }, [fetchGlobalHours]);

  useEffect(() => {
    if (globalHours) {
      setLocalGlobal({
        openingTime: globalHours.openingTime,
        closingTime: globalHours.closingTime,
        defaultInterval: globalHours.defaultInterval
      });
      setLocalContact({
        whatsappPhone: globalHours.whatsapp_phone || '',
        instagramUsername: globalHours.instagram_username || ''
      });
    }
  }, [globalHours]);

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

  const handleSaveGlobalHours = () => {
    const newConflicts = [];
    if (config?.schedule) {
      const gOpenMins = toMinutes(localGlobal.openingTime);
      let gCloseMins = toMinutes(localGlobal.closingTime);
      if (gCloseMins <= gOpenMins) gCloseMins += 1440;

      Object.keys(config.schedule).forEach(day => {
        const dayConfig = config.schedule[day];
        if (dayConfig.shifts) {
          dayConfig.shifts.forEach((shift, idx) => {
            const sOpenMins = toMinutes(shift.openingTime);
            let sCloseMins = toMinutes(shift.closingTime);
            if (sCloseMins <= sOpenMins) sCloseMins += 1440;

            if (sOpenMins < gOpenMins || sCloseMins > gCloseMins) {
              const suffix = toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? '' : '';
              newConflicts.push({ day, shiftId: shift.id, text: `${DAY_LABELS[day]} Turno ${idx + 1}: ${shift.openingTime} – ${shift.closingTime}${suffix}` });
            }
          });
        }
      });
    }

    if (newConflicts.length > 0) {
      setConflicts(newConflicts);
      setConflictModalOpen(true);
    } else {
      executeSaveGlobalHours(false);
    }
  };

  const executeSaveGlobalHours = async (removeConflicts) => {
    setSavingGlobal(true);
    try {
      let newConfig = { ...config };
      if (removeConflicts && conflicts.length > 0) {
        conflicts.forEach(c => {
          const dayShifts = newConfig.schedule[c.day].shifts;
          newConfig.schedule[c.day].shifts = dayShifts.filter(s => s.id !== c.shiftId);
        });
        setConfig(newConfig);
      }

      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          ...newConfig,
          global_opening_time: localGlobal.openingTime,
          global_closing_time: localGlobal.closingTime,
          default_interval: localGlobal.defaultInterval,
          whatsapp_phone: localContact.whatsappPhone,
          instagram_username: localContact.instagramUsername
        })
      });

      useSettingsStore.getState().setGlobalHours({
        ...localGlobal,
        whatsapp_phone: localContact.whatsappPhone,
        instagram_username: localContact.instagramUsername
      });
      
      setToastMessage("Horario global guardado");
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 2000);
      setConflictModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          ...config,
          global_opening_time: localGlobal.openingTime,
          global_closing_time: localGlobal.closingTime,
          default_interval: localGlobal.defaultInterval,
          whatsapp_phone: localContact.whatsappPhone,
          instagram_username: localContact.instagramUsername
        })
      });

      useSettingsStore.getState().setGlobalHours({
        ...localGlobal,
        whatsapp_phone: localContact.whatsappPhone,
        instagram_username: localContact.instagramUsername
      });

      setToastMessage("Contacto guardado");
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingContact(false);
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

  if (loading || !config) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {toastOpen && (
        <Box sx={{ 
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', 
          bgcolor: '#323232', color: '#fff', px: '16px', py: '12px', borderRadius: '4px',
          fontFamily: 'Roboto', fontSize: '14px', zIndex: 9999, boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          {toastMessage}
        </Box>
      )}

      <Dialog open={conflictModalOpen} onClose={() => setConflictModalOpen(false)} PaperProps={{ sx: { p: '24px', borderRadius: '4px', bgcolor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } }}>
        <Box sx={{ mb: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: '#F29900' }}>warning</span>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
            Conflicto de horarios
          </Typography>
        </Box>
        <DialogContent sx={{ p: 0, pb: '24px' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A', mb: '16px' }}>
            Los siguientes turnos quedan fuera del nuevo horario:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#70757A', fontFamily: 'Roboto', fontSize: '14px' }}>
            {conflicts.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>• {c.text}</li>)}
          </ul>
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A', mt: '16px', fontWeight: 500 }}>
            Estos turnos serán eliminados automáticamente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: '8px', sm: '0' } }}>
          <Button onClick={() => setConflictModalOpen(false)} sx={{ width: { xs: '100%', sm: 'auto' }, height: { xs: 44, sm: 36 }, px: '16px', borderRadius: '4px', border: '1px solid #1A73E8', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, textTransform: 'uppercase' }}>
            CANCELAR
          </Button>
          <Button onClick={() => executeSaveGlobalHours(true)} variant="contained" sx={{ width: { xs: '100%', sm: 'auto' }, ml: { xs: 0, sm: '8px' }, height: { xs: 44, sm: 36 }, px: '16px', borderRadius: '4px', bgcolor: '#1A73E8', color: '#fff', fontFamily: 'Roboto', fontWeight: 500, textTransform: 'uppercase', boxShadow: 'none' }}>
            GUARDAR DE TODAS FORMAS
          </Button>
        </DialogActions>
      </Dialog>
      
      {savedMsg && <Alert severity="success" sx={{ mb: 2 }}>{savedMsg}</Alert>}

      {/* Restaurant Details Card */}
      <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Restaurant Details</Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Estos detalles son visibles para los clientes.</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px', mb: '24px' }}>
          <TextField
            label="Nombre del restaurante"
            variant="outlined"
            value={config.restaurant?.name || ''}
            onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, name: e.target.value } })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Dirección"
            variant="outlined"
            value={config.restaurant?.address || ''}
            onChange={(e) => setConfig({ ...config, restaurant: { ...config.restaurant, address: e.target.value } })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" onClick={() => handleSaveAll(false)} disabled={savingSettings}
            sx={{ 
              width: { xs: '100%', sm: 'auto' }, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingSettings ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR DETALLES'}
          </Button>
        </Box>
      </Paper>

      {/* Contacto para Cancelaciones Card */}
      <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Contacto para Cancelaciones</Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '20px' }}>Los clientes verán estos enlaces en su confirmación para poder cancelar su reserva.</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', mb: '24px' }}>
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>NÚMERO DE WHATSAPP</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="34612345678"
              value={localContact.whatsappPhone}
              onChange={(e) => setLocalContact({ ...localContact, whatsappPhone: e.target.value.replace(/\D/g, '') })}
              helperText="Solo dígitos, sin +. Ejemplo: 34612345678"
              InputProps={{ 
                sx: { 
                  height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' }
                } 
              }}
              FormHelperTextProps={{ sx: { fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>USUARIO DE INSTAGRAM</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="hotaru.madrid"
              value={localContact.instagramUsername}
              onChange={(e) => setLocalContact({ ...localContact, instagramUsername: e.target.value.replace('@', '') })}
              helperText="Solo el nombre de usuario, sin @"
              InputProps={{ 
                sx: { 
                  height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' }
                } 
              }}
              FormHelperTextProps={{ sx: { fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' } }}
            />
            {localContact.instagramUsername && (
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#1A73E8', mt: '4px' }}>
                instagram.com/{localContact.instagramUsername}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" onClick={handleSaveContact} disabled={savingContact}
            sx={{ 
              width: { xs: '100%', sm: 'auto' }, height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingContact ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR CONTACTO'}
          </Button>
        </Box>
      </Paper>

      {/* Horario del Restaurante Card */}
      <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Horario del Restaurante</Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Define el horario global. Ningún turno puede salir fuera de estos límites.</Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Apertura global</Typography>
            <FormControl size="small" sx={{ width: '100%' }}>
              <Select 
                value={localGlobal.openingTime} 
                onChange={(e) => setLocalGlobal({ ...localGlobal, openingTime: e.target.value })}
                sx={{ height: { xs: 52, sm: 40 }, borderRadius: '4px', fontFamily: 'Roboto', fontSize: { xs: '16px', sm: '14px' }, color: '#202124' }}
              >
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Cierre global</Typography>
            <FormControl size="small" sx={{ width: '100%' }}>
              <Select 
                value={localGlobal.closingTime} 
                onChange={(e) => setLocalGlobal({ ...localGlobal, closingTime: e.target.value })}
                sx={{ height: { xs: 52, sm: 40 }, borderRadius: '4px', fontFamily: 'Roboto', fontSize: { xs: '16px', sm: '14px' }, color: '#202124' }}
              >
                {TIME_OPTIONS.map(t => {
                  const isNextDay = toMinutes(t) <= toMinutes(localGlobal.openingTime);
                  return (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {(() => {
              let cMins = toMinutes(localGlobal.closingTime);
              if (cMins <= toMinutes(localGlobal.openingTime)) cMins += 1440;
              const span = cMins - toMinutes(localGlobal.openingTime);
              if (span < 60) {
                return (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#D93025', mt: '4px', position: { sm: 'absolute' } }}>
                    El horario debe abarcar al menos 1 hora
                  </Typography>
                );
              }
              return null;
            })()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Intervalo base</Typography>
            <FormControl size="small" sx={{ width: '100%' }}>
              <Select 
                value={localGlobal.defaultInterval} 
                onChange={(e) => setLocalGlobal({ ...localGlobal, defaultInterval: e.target.value })}
                sx={{ height: { xs: 52, sm: 40 }, borderRadius: '4px', fontFamily: 'Roboto', fontSize: { xs: '16px', sm: '14px' }, color: '#202124' }}
              >
                {INTERVAL_OPTIONS.map(i => <MenuItem key={i} value={i}>{i} min</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: '24px', sm: '12px' }, p: '12px', bgcolor: '#E8F0FE', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', mb: '24px' }}>
          <span className="material-icons" style={{ fontSize: 16, color: '#1A73E8' }}>info</span>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#1A73E8' }}>Horario permitido: {localGlobal.openingTime} – {localGlobal.closingTime} {toMinutes(localGlobal.closingTime) <= toMinutes(localGlobal.openingTime) ? '' : ''}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" onClick={handleSaveGlobalHours} disabled={savingGlobal || (() => { let c = toMinutes(localGlobal.closingTime); if (c <= toMinutes(localGlobal.openingTime)) c += 1440; return (c - toMinutes(localGlobal.openingTime)) < 60; })()}
            sx={{ 
              width: { xs: '100%', sm: 'auto' }, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingGlobal ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR HORARIO'}
          </Button>
        </Box>
      </Paper>

      {/* Reservation Rules Card */}
      <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Reservation Rules</Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Configura límites generales para reservaciones públicas.</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px', mb: '24px' }}>
          <TextField
            label="Mínimo de personas" type="number" variant="outlined" value={config.minGuests} onChange={(e) => setConfig({ ...config, minGuests: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Máximo de personas" type="number" variant="outlined" value={config.maxGuests} onChange={(e) => setConfig({ ...config, maxGuests: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" onClick={() => handleSaveAll(false)} disabled={savingSettings}
            sx={{ 
              width: { xs: '100%', sm: 'auto' }, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            {savingSettings ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR REGLAS'}
          </Button>
        </Box>
      </Paper>

      {/* Capacidad Total Card */}
      <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Capacidad Total</Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '24px' }}>Número máximo de personas que el restaurante puede atender simultáneamente.</Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px', mb: '24px' }}>
          <TextField
            label="Capacidad de personas" type="number" variant="outlined" value={config.totalCapacity} onChange={(e) => setConfig({ ...config, totalCapacity: e.target.value })}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
            sx={{ maxWidth: { xs: '100%', sm: 200 } }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" onClick={() => handleSaveAll(true)} disabled={savingCap}
            sx={{ 
              width: { xs: '100%', sm: 'auto' }, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
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
