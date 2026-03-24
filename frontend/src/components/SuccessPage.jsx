import { Box, Typography, Button, Container } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function SuccessPage() {
  const { reservationId, reset } = useReservationStore();

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', minHeight: '100vh', textAlign: 'center', py: 4 
      }}>
        <span className="material-icons" style={{ fontSize: 80, marginBottom: 24, color: '#1A73E8' }}>check_circle</span>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reservation Confirmed
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Thank you! Exploring amazing food just got easier. We have received your booking and you will receive a confirmation message via WhatsApp and Email shortly.
        </Typography>

        <Box sx={{ 
          bgcolor: '#F1F3F4', py: 4, px: 6, borderRadius: '4px', mb: 6,
          border: '1px solid #E0E0E0' 
        }}>
          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
            Reservation ID
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            {reservationId}
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          size="large"
          color="primary"
          onClick={reset}
          sx={{ borderRadius: '4px', px: 4, height: 48 }}
        >
          Book another table
        </Button>
      </Box>
    </Container>
  );
}
