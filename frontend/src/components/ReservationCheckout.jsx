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

  const { date, guests, selectedSlot, userData, setUserData } = store;

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const hasName = userData.name.trim().length > 0;
  const hasPhoneOrEmail = userData.email.trim().length > 0 || userData.phone.trim().length > 0;
  const validEmailIfPresent = userData.email.trim() === '' || isEmailValid(userData.email);

  const isValid = hasName && hasPhoneOrEmail && validEmailIfPresent;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = { date, guests, slot: selectedSlot, user: userData };
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: { xs: 2, md: 6 } }}>
      <Container maxWidth="md">
        <Button 
          startIcon={<span className="material-icons">arrow_back</span>} 
          onClick={onBack} 
          sx={{ mb: 4 }}
          disabled={submitting}
        >
          Back to availability
        </Button>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 4, md: 6 }, bgcolor: '#FFFFFF' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Complete your reservation
            </Typography>
            
            <Box sx={{ mt: 4, mb: 6, p: 4, bgcolor: '#F1F3F4', borderRadius: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <span className="material-icons" style={{ marginRight: 16, marginTop: 4, color: '#70757A', fontSize: 24 }}>restaurant</span>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Group of {guests} · Standard Table
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {store.config?.restaurant?.name}{store.config?.restaurant?.address ? ` · ${store.config.restaurant.address}` : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <span className="material-icons" style={{ marginRight: 16, marginTop: 4, color: '#70757A', fontSize: 24 }}>calendar_today</span>
                <Box>
                  <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                    {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedSlot?.time}
                  </Typography>
                </Box>
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 400 }}>
                By continuing, you agree to the{' '}
                <Box 
                  component="span" 
                  sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => store.setShowTerms(true)}
                >
                  Terms of Service
                </Box>.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleConfirm} 
                disabled={!isValid || submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ minWidth: 200, height: 48 }}
              >
                {submitting ? 'Confirming...' : 'Reserve Table'}
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
