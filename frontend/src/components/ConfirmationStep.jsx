import { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

export default function ConfirmationStep({ onSuccess, onBack }) {
  const state = useReservationStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        date: state.date,
        time: state.selectedTime,
        guests: state.guests,
        user: state.userData
      };
      const res = await createReservation(payload);
      if (res.success) {
        useReservationStore.setState({ reservationId: res.reservationId });
        onSuccess();
      } else {
        setErrorMsg("Failed to create reservation.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Review Your Request</Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography sx={{ mb: 1 }}><strong>Date:</strong> {state.date}</Typography>
        <Typography sx={{ mb: 1 }}><strong>Time:</strong> {state.selectedTime}</Typography>
        <Typography sx={{ mb: 1 }}><strong>Guests:</strong> {state.guests}</Typography>
        <Typography sx={{ mb: 1 }}><strong>Name:</strong> {state.userData.firstName} {state.userData.lastName}</Typography>
        <Typography sx={{ mb: 1 }}><strong>Email:</strong> {state.userData.email}</Typography>
        <Typography sx={{ mb: 1 }}><strong>Phone:</strong> {state.userData.phone}</Typography>
        {state.userData.specialRequests && (
          <Typography sx={{ mb: 1 }}><strong>Special Requests:</strong> {state.userData.specialRequests}</Typography>
        )}
      </Paper>
      
      {errorMsg && (
        <Typography color="error" sx={{ mb: 2 }}>{errorMsg}</Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={submitting}>Back</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirm} 
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {submitting ? 'Confirming...' : 'Confirm Reservation'}
        </Button>
      </Box>
    </Box>
  );
}
