import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, TextField, Button, Dialog, 
  Select, MenuItem, FormControl, Grid, Divider,
  DialogContent, DialogActions 
} from '@mui/material';
import { useSettingsStore } from '../store/useSettingsStore';
import { apiClient, API_BASE_URL, clearCache } from '../../shared/api';
import RestaurantLogo from '../../shared/RestaurantLogo';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';
import { useToast } from '../components/Toast/ToastContext';
import { CardSkeleton, PageHeaderSkeleton } from '../components/Skeletons';

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

  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const globalHours = useSettingsStore(state => state.globalHours);
  
  const [localGlobal, setLocalGlobal] = useState({ openingTime: '09:00', closingTime: '00:00', defaultInterval: 30 });
  const [localContact, setLocalContact] = useState({ whatsappPhone: '', instagramUsername: '', businessPhone: '', businessEmail: '', address: '', reviewLink: '' });
  const [localLinks, setLocalLinks] = useState({ googleMapsLink: '', menuPdfUrl: '', menuPdfFile: null, reservationLink: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const toast = useToast();

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
        instagramUsername: globalHours.instagram_username || '',
        businessPhone: globalHours.business_phone || '',
        businessEmail: globalHours.business_email || '',
        address: globalHours.address || '',
        reviewLink: globalHours.review_link || ''
      });
      setLocalLinks({
        googleMapsLink: globalHours.google_maps_link || '',
        menuPdfUrl: globalHours.menu_pdf_url || '',
        menuPdfFile: null,
        reservationLink: globalHours.reservation_link || ''
      });
      setLogoPreview(globalHours.logo_url || '');
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
        business_name: data.business_name || 'Hechizo Hookah Lounge',
        minGuests: data.minGuests || 1,
        maxGuests: data.maxGuests || 10
      });
      setLogoPreview(data.logo_url || '');
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
          instagram_username: localContact.instagramUsername,
          business_phone: localContact.businessPhone,
          review_link: localContact.reviewLink
        })
      });
      await fetchGlobalHours();
      
      toast.success("Horario global guardado");
      setConflictModalOpen(false);
    } catch (e) {
      toast.error('Error al guardar horario global');
    } finally {
      setSavingGlobal(false);
    }
  };

  const uploadLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/config`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir logo');

      clearCache('/config');
      await fetchConfig();
      await fetchGlobalHours();
      toast.success("Logo actualizado exitosamente");
    } catch (e) {
      toast.error('Error al subir el logo: ' + e.message);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      const formData = new FormData();
      formData.append('whatsapp_phone', localContact.whatsappPhone);
      formData.append('instagram_username', localContact.instagramUsername);
      formData.append('business_phone', localContact.businessPhone);
      formData.append('business_email', localContact.businessEmail);
      formData.append('address', localContact.address);
      formData.append('review_link', localContact.reviewLink);
      formData.append('google_maps_link', localLinks.googleMapsLink);
      formData.append('reservation_link', localLinks.reservationLink);
      if (localLinks.menuPdfFile) {
        formData.append('menu_pdf', localLinks.menuPdfFile);
      }

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/config`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save');

      clearCache('/config');
      setLocalLinks(prev => ({ ...prev, menuPdfFile: null }));
      await fetchConfig();
      await fetchGlobalHours();
      toast.success("Información de contacto guardada");
    } catch (e) {
      toast.error('Error al guardar información');
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveAll = async () => {
    setSavingSettings(true);
    
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      await fetchGlobalHours();
      toast.success("Ajustes guardados exitosamente.");
    } catch (e) {
      toast.error('Error al guardar ajustes');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || !config) return (
    <Box sx={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeaderSkeleton />
      <CardSkeleton />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '24px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>

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

      {/* Restaurant Identity Card */}
      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RestaurantLogo
            logoUrl={logoPreview}
            restaurantName={config.business_name}
            size={96}
          />

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("El archivo no debe superar 2MB");
                  e.target.value = '';
                  return;
                }
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
                uploadLogo(file);
              }
            }}
            style={{ display: 'none' }}
            id="logo-upload"
          />
          <label htmlFor="logo-upload">
            <Button
              size="small"
              component="span"
              sx={{ mt: '4px', color: '#1A73E8', fontFamily: 'Roboto', fontSize: '12px', textTransform: 'none', p: '4px 8px' }}
            >
              {logoPreview ? 'Cambiar' : 'Subir'}
            </Button>
          </label>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124' }}>
            {config.business_name || 'Negocio'}
          </Typography>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mt: '4px' }}>
            {localContact.address || ''}
          </Typography>

        </Box>
      </Paper>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: '24px', 
        width: '100%',
        alignItems: 'start'
      }}>
        {/* Left Column: Detalle, Información de Contacto, Enlaces Rápidos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Restaurant Details Card */}
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Detalle</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Estos detalles son visibles para los clientes.</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px', mb: '24px' }}>
              <TextField
                label="Nombre del negocio"
                variant="outlined"
                value={config.business_name || ''}
                onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Dirección"
                variant="outlined"
                value={localContact.address || ''}
                onChange={(e) => setLocalContact({ ...localContact, address: e.target.value })}
                InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" onClick={handleSaveAll} disabled={savingSettings}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' }, minWidth: 160, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {savingSettings ? 'Guardando...' : 'Guardar Detalles'}
              </Button>
            </Box>
          </Paper>

          {/* Contacto Card */}
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Información de Contacto</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '20px' }}>Enlaces para que los clientes puedan contactar con el negocio.</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', mb: '24px' }}>
              <Box>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Número de WhatsApp</Typography>
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



              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Usuario de Instagram</Typography>
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

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Email del negocio</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="contacto@negocio.com"
                  value={localContact.businessEmail}
                  onChange={(e) => setLocalContact({ ...localContact, businessEmail: e.target.value })}
                  InputProps={{ 
                    sx: { 
                      height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' }
                    } 
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" onClick={handleSaveContact} disabled={savingContact}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' }, minWidth: 160, height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {savingContact ? 'Guardando...' : 'Guardar Información'}
              </Button>
            </Box>
          </Paper>

          {/* Enlaces Rápidos Card */}
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Enlaces Rápidos</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '20px' }}>Enlaces para copiar y compartir con clientes.</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', mb: '24px' }}>
              <Box>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Google Maps</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="https://maps.google.com/..."
                  value={localLinks.googleMapsLink}
                  onChange={(e) => setLocalLinks({ ...localLinks, googleMapsLink: e.target.value })}
                  helperText="Enlace directo a Google Maps del negocio"
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
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Enlace de Reserva</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="/reservacion"
                  value={localLinks.reservationLink}
                  onChange={(e) => setLocalLinks({ ...localLinks, reservationLink: e.target.value })}
                  helperText="Si se deja vacío, se usa la ruta por defecto"
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
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '6px', textTransform: 'uppercase' }}>Menú PDF</Typography>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 50 * 1024 * 1024) {
                        toast.error("El archivo no debe superar 50MB");
                        e.target.value = '';
                        return;
                      }
                      setLocalLinks({ ...localLinks, menuPdfFile: file, menuPdfUrl: URL.createObjectURL(file) });
                    }
                  }}
                  style={{ display: 'none' }}
                  id="menu-pdf-upload"
                />
                <label htmlFor="menu-pdf-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<span className="material-icons" style={{ fontSize: 18 }}>upload_file</span>}
                    sx={{
                      border: '1px solid #DADCE0', color: '#202124', height: 56, px: '24px', borderRadius: '4px',
                      fontFamily: 'Roboto', fontSize: '14px', textTransform: 'none', boxShadow: 'none',
                      '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
                    }}
                  >
                    Subir menú PDF (máx. 50MB)
                  </Button>
                </label>
                {localLinks.menuPdfFile && (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#1E8E3E', mt: '8px' }}>
                    Archivo seleccionado: {localLinks.menuPdfFile.name}
                  </Typography>
                )}
                {localLinks.menuPdfUrl && !localLinks.menuPdfFile && (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#1A73E8', mt: '8px' }}>
                    Archivo actual: <a href={localLinks.menuPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1A73E8' }}>Ver PDF</a>
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" onClick={handleSaveContact} disabled={savingContact}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' }, minWidth: 160, height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {savingContact ? 'Guardando...' : 'Guardar Enlaces'}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right Column: Rango Global, Reglas de Reserva */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Horario Card */}
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Rango Global para Aceptar Reservaciones</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Define el rango horario en el que se pueden aceptar reservaciones. Ningún turno puede salir fuera de estos límites.</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              </Box>

              <Box sx={{ width: '100%' }}>
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

            <Box sx={{ mt: 3, mb: 3, p: '12px', bgcolor: '#E8F0FE', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#1A73E8' }}>info</span>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#1A73E8' }}>Horario permitido: {localGlobal.openingTime} – {localGlobal.closingTime}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" onClick={handleSaveGlobalHours} disabled={savingGlobal || (() => { let c = toMinutes(localGlobal.closingTime); if (c <= toMinutes(localGlobal.openingTime)) c += 1440; return (c - toMinutes(localGlobal.openingTime)) < 60; })()}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' }, minWidth: 160, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {savingGlobal ? 'Guardando...' : 'Guardar Horario'}
              </Button>
            </Box>
          </Paper>

          {/* Rules Card */}
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: '4px' }}>Reglas de Reserva</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '16px' }}>Configura límites generales para reservaciones públicas.</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', mb: '24px' }}>
              <TextField
                label="Mínimo de personas" type="number" variant="outlined" value={config.minGuests} onChange={(e) => setConfig({ ...config, minGuests: e.target.value })}
                InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
                fullWidth
              />
              <TextField
                label="Máximo de personas" type="number" variant="outlined" value={config.maxGuests} onChange={(e) => setConfig({ ...config, maxGuests: e.target.value })}
                InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                InputProps={{ sx: { height: { xs: 52, sm: 56 }, fontFamily: 'Roboto', fontWeight: 400, fontSize: { xs: '16px', sm: '14px' }, color: '#202124', borderRadius: '4px' } }}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" onClick={handleSaveAll} disabled={savingSettings}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' }, minWidth: 160, height: { xs: 44, sm: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {savingSettings ? 'Guardando...' : 'Guardar Reglas'}
              </Button>
            </Box>
          </Paper>

        </Box>
      </Box>
    </Box>
  );
}
