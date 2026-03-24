import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';

import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

export default function ReservationDialog({ open, onClose, onSuccess }) {
  const store = useReservationStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { date, guests, selectedSlot, userData, setUserData } = store;

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = userData.firstName.trim() && 
                  userData.lastName.trim() && 
                  userData.phone.trim() && 
                  isEmailValid(userData.email);

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
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
            <Typography>{date}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
            <Typography>{selectedSlot?.time}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
            <Typography>{guests} Guests</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Contact Details
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth label="First Name" size="small"
            value={userData.firstName}
            onChange={(e) => setUserData({ firstName: e.target.value })}
          />
          <TextField
            fullWidth label="Last Name" size="small"
            value={userData.lastName}
            onChange={(e) => setUserData({ lastName: e.target.value })}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth label="Email" type="email" size="small"
            value={userData.email}
            onChange={(e) => setUserData({ email: e.target.value })}
            error={userData.email.length > 0 && !isEmailValid(userData.email)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth label="Phone" size="small"
            value={userData.phone}
            onChange={(e) => setUserData({ phone: e.target.value })}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth label="Special Request (optional)" multiline rows={3} size="small"
            value={userData.specialRequests}
            onChange={(e) => setUserData({ specialRequests: e.target.value })}
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
          sx={{ borderRadius: 8 }}
        >
          {submitting ? 'Confirming...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
