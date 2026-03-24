import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, CircularProgress,
  IconButton, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantIcon from '@mui/icons-material/Restaurant';

import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

export default function ReservationDialog({ open, onClose, onSuccess }) {
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
        setErrorMsg("Failed to book reservation.");
      }
    } catch (err) {
      setErrorMsg("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Complete Reservation</Typography>
        <IconButton onClick={onClose} disabled={submitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3, pt: 1, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <RestaurantIcon sx={{ mr: 2, mt: 0.5, color: '#5f6368', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={500} sx={{ color: '#202124' }}>
                Group of {guests} · Standard Table
              </Typography>
              <Typography variant="body2" sx={{ color: '#5f6368', mt: 0.5 }}>
                {store.config?.restaurant?.name || 'La Trattoria'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <CalendarTodayIcon sx={{ mr: 2, mt: 0.5, color: '#5f6368', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={500} sx={{ color: '#202124', textTransform: 'capitalize' }}>
                {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5f6368', mt: 0.5 }}>
                {selectedSlot?.time} (CET)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Please let us know if you decide not to come so we can cancel your reservation and free up the table.
        </Alert>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Contact Details
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth label="Full Name" size="small"
            required
            value={userData.name}
            onChange={(e) => setUserData({ name: e.target.value })}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1 }}>
          <TextField
            fullWidth label="Email" type="email" size="small"
            value={userData.email}
            onChange={(e) => setUserData({ email: e.target.value })}
            error={userData.email.length > 0 && !isEmailValid(userData.email)}
            helperText="Provide either Email or WhatsApp Phone"
          />
          <TextField
            fullWidth label="Phone (WhatsApp registered)" size="small"
            value={userData.phone}
            onChange={(e) => setUserData({ phone: e.target.value })}
            helperText=" "
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth label="Special Request (optional)" multiline rows={3} size="small"
            value={userData.specialRequests}
            onChange={(e) => setUserData({ specialRequests: e.target.value })}
            sx={{ mt: 1 }}
          />
        </Box>

        {errorMsg && (
          <Typography color="error" variant="body2">{errorMsg}</Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ flexGrow: 1, color: 'text.secondary', pl: 1 }}>
          By continuing, you agree to the Terms of Service.
        </Typography>
        <Button onClick={onClose} disabled={submitting} sx={{ borderRadius: 8 }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm} 
          disabled={!isValid || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ borderRadius: 8, px: 3 }}
        >
          {submitting ? 'Confirming...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
