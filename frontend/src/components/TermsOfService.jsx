import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReservationStore } from '../store/useReservationStore';

export default function TermsOfService() {
  const { setShowTerms } = useReservationStore();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => setShowTerms(false)}
        sx={{ mb: 4 }}
      >
        Back to Reservation
      </Button>
      
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Terms of Service
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          By booking a reservation, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our reservation system.
        </Typography>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          2. Reservation Policies
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Reservations are held for a maximum of 15 minutes past the scheduled time. If your party is late, we reserve the right to forfeit your table to other waiting guests.
        </Typography>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          3. Cancellations
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please notify us at least 24 hours in advance if you need to cancel or modify your reservation. Repeated no-shows without cancellation may result in restricted access to future bookings.
        </Typography>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          4. Data Privacy
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your contact information, including your full name, email address, and WhatsApp registered phone number, is securely stored. We use this exclusively to confirm and manage your booking. We never share your data with third parties.
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          color="primary"
          onClick={() => setShowTerms(false)}
          sx={{ borderRadius: 8, px: 6 }}
        >
          I Understand & Return
        </Button>
      </Box>
    </Container>
  );
}
