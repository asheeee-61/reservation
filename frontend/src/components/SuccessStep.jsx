import { Box, Button, Typography, Container, Card, CardContent } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useReservationStore } from '../store/useReservationStore';

export default function SuccessStep() {
  const reservationId = useReservationStore(state => state.reservationId);
  const reset = useReservationStore(state => state.reset);

  return (
    <Box textAlign="center" py={4}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reservation Confirmed!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your reservation has been successfully placed. Your confirmation number is:
      </Typography>
      <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 4, bgcolor: '#fce4ec', py: 2, borderRadius: 2 }}>
        {reservationId}
      </Typography>
      <Button variant="outlined" onClick={reset}>
        Make Another Reservation
      </Button>
    </Box>
  );
}
