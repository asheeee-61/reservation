import { Typography, Box, Paper, Button, Grid, Chip, Divider } from '@mui/material';
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
  
  const resData = location.state?.reservation || {};

  return (
    <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Box>
        <Button 
          startIcon={<span className="material-icons">arrow_back</span>} 
          onClick={() => navigate('/reservations')} 
          sx={{ color: '#70757A', textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}
        >
          Back to Reservations
        </Button>
      </Box>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
            Reservation #{resData.reservation_id || id}
          </Typography>
          {resData.status && (
            <Chip 
              label={resData.status.toUpperCase()} 
              color={STATUS_COLORS[resData.status] || 'default'}
              size="small"
              sx={{ fontWeight: 500, borderRadius: '4px', fontFamily: 'Roboto' }}
            />
          )}
        </Box>

        <Divider sx={{ mb: '24px' }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mb: '4px' }}>Customer Name</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{resData.customer?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mb: '4px' }}>Date & Time</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{resData.date || 'N/A'} at {resData.time || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mb: '4px' }}>Phone (WhatsApp)</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{resData.customer?.phone || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mb: '4px' }}>Number of Guests</Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{resData.guests || 0} Guests</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mb: '4px' }}>Notes / Special Requests</Typography>
            <Box sx={{ mt: '4px', p: '16px', bgcolor: '#F1F3F4', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{resData.special_requests || 'No special requests provided.'}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Button 
            variant="contained" 
            startIcon={<span className="material-icons">edit</span>}
            onClick={() => navigate(`/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
            disabled={!resData.id}
            sx={{ 
              height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            Edit Reservation
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
