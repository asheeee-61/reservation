import { useState } from 'react';
import { 
  Button, TextField, Typography, Box, CircularProgress,
  IconButton, Backdrop, Container, Paper, Divider
} from '@mui/material';
import { useToast } from '../../admin/components/Toast/ToastContext';

import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

export default function ReservationCheckout({ onBack, onSuccess }) {
  const store = useReservationStore();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const { 
    date, guests, selectedSlot, selectedZone, selectedEvent, 
    userData, setUserData, config 
  } = store;

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const hasName = userData.name.trim().length > 0;
  const hasPhoneOrEmail = userData.email.trim().length > 0 || userData.phone.trim().length > 0;
  const validEmailIfPresent = userData.email.trim() === '' || isEmailValid(userData.email);

  const isValid = hasName && hasPhoneOrEmail && validEmailIfPresent;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = { 
        date, 
        guests, 
        slot: selectedSlot, 
        user: userData,
        zone_id: selectedZone?.id,
        event_id: selectedEvent?.id
      };
      const res = await createReservation(payload);
      if (res.success) {
        useReservationStore.setState({ reservationId: res.reservationId });
        toast.success("Reserva confirmada con éxito");
        onSuccess(res.reservationId);
      } else {
        toast.error(res.message || "Error al realizar la reserva.");
      }
    } catch (err) {
      toast.error(err.message || "Ha ocurrido un error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: { xs: 0, sm: 2, md: 6 } }}>
      <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>

        <Paper sx={{ borderRadius: { xs: 0, sm: 4 }, minHeight: { xs: '100vh', sm: 'auto' } }}>
          <Box sx={{ p: { xs: 3, sm: 4, md: 6 }, bgcolor: '#FFFFFF', position: 'relative' }}>
            <IconButton 
              onClick={onBack}
              sx={{ position: 'absolute', top: 16, left: 16, color: '#70757A' }}
            >
              <span className="material-icons">arrow_back</span>
            </IconButton>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontSize: '14px', letterSpacing: '2px' }}>{config?.business?.name || 'Negocio'}</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '24px', color: '#202124' }}>
                Complete su reserva
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, mb: 4, p: 4, bgcolor: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: '8px' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 24 }}>calendar_today</span>
                  <Typography variant="h6" sx={{ fontSize: '18px', color: '#202124', textTransform: 'capitalize' }}>
                    {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 24 }}>schedule</span>
                  <Typography variant="h6" sx={{ fontSize: '18px', color: '#202124' }}>
                    {typeof selectedSlot === 'string' ? selectedSlot : selectedSlot?.time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 24 }}>group</span>
                  <Typography variant="h6" sx={{ fontSize: '18px', color: '#202124' }}>
                    {guests} personas
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 24 }}>map</span>
                  <Typography variant="h6" sx={{ fontSize: '18px', color: '#202124' }}>
                    {selectedZone?.name || 'Cualquier zona'}
                  </Typography>
                </Box>
                {selectedEvent && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 24 }}>auto_awesome</span>
                    <Typography variant="h6" sx={{ fontSize: '18px', color: '#202124' }}>
                      {selectedEvent.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>


            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: '18px', color: '#202124' }}>
              Datos de contacto
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth label="Nombre completo"
                required
                value={userData.name}
                onChange={(e) => setUserData({ name: e.target.value })}
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 1.5 }}>
              <TextField
                fullWidth label="Correo electrónico" type="email"
                placeholder="nombre@ejemplo.com"
                value={userData.email}
                onChange={(e) => setUserData({ email: e.target.value })}
                error={userData.email.length > 0 && !isEmailValid(userData.email)}
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
              />
              <TextField
                fullWidth label="Teléfono (Preferiblemente WhatsApp)"
                placeholder="+34 600 000 000"
                value={userData.phone}
                onChange={(e) => setUserData({ phone: e.target.value })}
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
              />
            </Box>
            <Typography variant="body2" sx={{ mb: 4, color: '#1A73E8', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
              <span className="material-icons" style={{ fontSize: 16, marginRight: 8 }}>info</span>
              Le enviaremos una confirmación por email o WhatsApp. Verifique sus datos.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth label="¿Algo más que debamos saber? (Opcional)" multiline rows={2}
                value={userData.specialRequests}
                onChange={(e) => setUserData({ specialRequests: e.target.value })}
                helperText="Por ejemplo: alergias alimentarias, necesidad de trona o detalles especiales para su evento."
                InputProps={{ sx: { fontSize: '16px' } }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: 'flex-end', 
              alignItems: 'stretch', 
              gap: 2, 
              mt: 4,
              pb: { xs: 4, sm: 0 } 
            }}>
              <Button 
                variant="contained" 
                onClick={handleConfirm} 
                disabled={!isValid || submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  borderRadius: '4px', 
                  height: 56, 
                  bgcolor: '#1A73E8', 
                  color: '#FFFFFF',
                  minWidth: { xs: '100%', sm: 180 },
                  boxShadow: 'none',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '15px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {submitting ? 'Confirmando...' : 'Confirmar reserva'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2, bgcolor: 'rgba(255, 255, 255, 0.7)' }} open={submitting}>
        <CircularProgress color="primary" />
        <Typography color="text.primary" fontWeight="bold">Confirmando su reserva...</Typography>
      </Backdrop>
    </Box>
  );
}
