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
        setErrorMsg(res.message || "Failed to book reservation.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: { xs: 0, sm: 2, md: 6 } }}>
      <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>

        <Paper sx={{ overflow: 'hidden', borderRadius: { xs: 0, sm: 4 }, minHeight: { xs: '100vh', sm: 'auto' } }}>
          <Box sx={{ p: { xs: 3, sm: 4, md: 6 }, bgcolor: '#FFFFFF' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Complete your reservation
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
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '14px', fontWeight: 400 }}>
                  {guests} personas
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>celebration</span>
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '14px', fontWeight: 400 }}>
                  {selectedSpecialEvent?.name || 'Sin evento especial'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-icons" style={{ marginRight: 16, color: '#70757A', fontSize: 20 }}>restaurant</span>
                <Typography sx={{ color: '#202124', fontFamily: 'Roboto', fontSize: '14px', fontWeight: 400 }}>
                  {selectedTableType?.name || 'Mesa estándar'}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 4, bgcolor: '#F1F3F4', borderRadius: '4px', p: 3, border: 'none', color: '#70757A' }}>
              Please let us know if you decide not to come so we can cancel your reservation and free up the table.
            </Alert>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We need a few details to manage your booking
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth label="Full Name" size="medium"
                required
                value={userData.name}
                onChange={(e) => setUserData({ name: e.target.value })}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 3 }}>
              <TextField
                fullWidth label="Email Address" type="email" size="medium"
                value={userData.email}
                onChange={(e) => setUserData({ email: e.target.value })}
                error={userData.email.length > 0 && !isEmailValid(userData.email)}
                helperText={userData.email.length > 0 && !isEmailValid(userData.email) ? 'Enter a valid email' : 'We will send you a confirmation'}
              />
              <TextField
                fullWidth label="Phone (WhatsApp)" size="medium"
                value={userData.phone}
                onChange={(e) => setUserData({ phone: e.target.value })}
                helperText="For urgent updates"
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth label="Special Requests (optional)" multiline rows={3} size="medium"
                value={userData.specialRequests}
                onChange={(e) => setUserData({ specialRequests: e.target.value })}
                placeholder="Allergies, wheelchair access, high chair..."
              />
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={onBack}
                disabled={submitting}
                sx={{ 
                  borderRadius: '4px', 
                  height: 48, 
                  color: '#1A73E8', 
                  borderColor: '#1A73E8',
                  minWidth: 120
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
                  height: 48, 
                  bgcolor: '#1A73E8', 
                  color: '#FFFFFF',
                  minWidth: 180,
                  boxShadow: 'none',
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
        <Typography color="text.primary" fontWeight="bold">Confirming your reservation...</Typography>
      </Backdrop>
    </Box>
  );
}
