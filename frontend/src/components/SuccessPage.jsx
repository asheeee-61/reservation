import { Box, Typography, Button, Container } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useReservationStore } from '../store/useReservationStore';

export default function SuccessPage() {
  const { reservationId, reset } = useReservationStore();

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', minHeight: '100vh', textAlign: 'center', py: 4 
      }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reservation Confirmed
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Thank you! Exploring amazing food just got easier. We have received your booking and you will receive a confirmation message via WhatsApp and Email shortly.
        </Typography>

        <Box sx={{ 
          bgcolor: 'grey.100', py: 2, px: 4, borderRadius: 2, mb: 4,
          border: '1px solid', borderColor: 'grey.300' 
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
          sx={{ borderRadius: 8, px: 4 }}
        >
          Book another table
        </Button>
      </Box>
    </Container>
  );
}
