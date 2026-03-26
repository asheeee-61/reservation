import { useState } from 'react';
import { 
  Button, TextField, Typography, Box, CircularProgress,
  IconButton, Alert, Backdrop, Container, Paper, Divider
} from '@mui/material';

import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

export default function ReservationCheckout({ onBack, onSuccess }) {
  const store = useReservationStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { date, guests, selectedSlot, selectedTableType, selectedSpecialEvent, userData, setUserData } = store;

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const hasName = userData.name.trim().length > 0;
  const hasPhoneOrEmail = userData.email.trim().length > 0 || userData.phone.trim().length > 0;
  const validEmailIfPresent = userData.email.trim() === '' || isEmailValid(userData.email);

  const isValid = hasName && hasPhoneOrEmail && validEmailIfPresent;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = { 
        date, 
        guests, 
        slot: selectedSlot, 
        user: userData,
        table_type_id: selectedTableType?.id,
        special_event_id: selectedSpecialEvent?.id
      };
      const res = await createReservation(payload);
      if (res.success) {
        useReservationStore.setState({ reservationId: res.reservationId });
        onSuccess(res.reservationId);
      } else {
        setErrorMsg(res.message || "Error al realizar la reserva.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Ha ocurrido un error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: { xs: 0, sm: 2, md: 6 } }}>
      <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>

        <Paper sx={{ overflow: 'hidden', borderRadius: { xs: 0, sm: 4 }, minHeight: { xs: '100vh', sm: 'auto' } }}>
          <Box sx={{ p: { xs: 3, sm: 4, md: 6 }, bgcolor: '#FFFFFF' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: '22px', color: '#202124' }}>
              Complete su reserva
            </Typography>
            
            <Box sx={{ mt: 4, mb: 6, p: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>calendar_today</span>
                <Typography variant="body1" sx={{ color: '#202124', textTransform: 'capitalize' }}>
                  {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>schedule</span>
                <Typography variant="body1" sx={{ color: '#202124' }}>
                  {selectedSlot?.time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>group</span>
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '15px', fontWeight: 400 }}>
                  {guests} personas
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>celebration</span>
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '15px', fontWeight: 400 }}>
                  {selectedSpecialEvent?.name || 'Sin evento especial'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>restaurant</span>
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '15px', fontWeight: 400 }}>
                  {selectedTableType?.name || 'Mesa estándar'}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 4, bgcolor: '#F1F3F4', borderRadius: '4px', p: 3, border: 'none', color: '#70757A', '& .MuiAlert-message': { fontSize: '14px' } }}>
              Por favor, avísenos si decide no venir para que podamos cancelar su reserva y liberar la mesa.
            </Alert>

            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '18px', color: '#202124' }}>
              Datos de contacto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontSize: '14px' }}>
              Necesitamos algunos datos para gestionar su reserva
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth label="Nombre completo"
                required
                value={userData.name}
                onChange={(e) => setUserData({ name: e.target.value })}
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
                InputLabelProps={{ sx: { fontSize: '16px' } }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 3 }}>
              <TextField
                fullWidth label="Correo electrónico" type="email"
                value={userData.email}
                onChange={(e) => setUserData({ email: e.target.value })}
                error={userData.email.length > 0 && !isEmailValid(userData.email)}
                helperText={userData.email.length > 0 && !isEmailValid(userData.email) ? 'Introduzca un email válido' : 'Le enviaremos una confirmación'}
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
                InputLabelProps={{ sx: { fontSize: '16px' } }}
              />
              <TextField
                fullWidth label="Teléfono (WhatsApp)"
                value={userData.phone}
                onChange={(e) => setUserData({ phone: e.target.value })}
                helperText="Para avisos urgentes"
                InputProps={{ sx: { height: 56, fontSize: '16px' } }}
                InputLabelProps={{ sx: { fontSize: '16px' } }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth label="Peticiones especiales (opcional)" multiline rows={3}
                value={userData.specialRequests}
                onChange={(e) => setUserData({ specialRequests: e.target.value })}
                placeholder="Alergias, silla de ruedas, trona..."
                InputProps={{ sx: { fontSize: '16px', pt: 2 } }}
                InputLabelProps={{ sx: { fontSize: '16px' } }}
              />
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={onBack}
                disabled={submitting}
                sx={{ 
                  borderRadius: '4px', 
                  height: 56, 
                  color: '#1A73E8', 
                  borderColor: '#1A73E8',
                  minWidth: 120,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontSize: '14px'
                }}
              >
                Editar
              </Button>
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
                  minWidth: 180,
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
