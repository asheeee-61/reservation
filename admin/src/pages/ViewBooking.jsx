import { Typography, Box, Paper, Button, Grid, Container, Chip, Divider } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const STATUS_COLORS = {
  'pending': 'warning',
  'confirmed': 'info',
  'cancelled': 'error',
  'no_show': 'secondary'
};

export default function ViewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Use state data if available, fallback to basic placeholders if not
  const resData = location.state?.reservation || {};

  return (
    <Container maxWidth={false} sx={{ pb: 8, pt: 2 }}>
      <Button 
        startIcon={<span className="material-icons">arrow_back</span>} 
        onClick={() => navigate('/reservations')} 
        sx={{ mb: 6 }}
      >
        Back to Reservations
      </Button>

      <Paper sx={{ p: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            Reservation #{resData.reservation_id || id}
          </Typography>
          {resData.status && (
            <Chip 
              label={resData.status.toUpperCase()} 
              color={STATUS_COLORS[resData.status] || 'default'}
              size="small"
              sx={{ fontWeight: 'bold', borderRadius: 1 }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block">Customer Name</Typography>
            <Typography variant="body1" fontWeight="500">{resData.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block">Date & Time</Typography>
            <Typography variant="body1">{resData.date || 'N/A'} at {resData.time || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block">Phone (WhatsApp)</Typography>
            <Typography variant="body1">{resData.phone || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block">Number of Guests</Typography>
            <Typography variant="body1">{resData.guests || 0} Guests</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block">Notes / Special Requests</Typography>
            <Paper elevation={0} sx={{ mt: 1, p: 3, bgcolor: '#F1F3F4', border: '1px solid #E0E0E0' }}>
              <Typography variant="body2">{resData.special_requests || 'No special requests provided.'}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<span className="material-icons">edit</span>}
            onClick={() => navigate(`/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
            disabled={!resData.id}
          >
            Edit Reservation
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
