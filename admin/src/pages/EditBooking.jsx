import { useState } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Grid, Alert, Container, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'no_show'];

export default function EditBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const resData = location.state?.reservation || {};

  const [editBooking, setEditBooking] = useState({
    name: resData.name || '', 
    phone: resData.phone || '', 
    email: resData.email || '', 
    date: resData.date || '', 
    time: resData.time || '', 
    guests: resData.guests || 2, 
    special_requests: resData.special_requests || '',
    status: resData.status || 'pending'
  });

  const handleSaveBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient(`/admin/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editBooking)
      });

      navigate('/reservations');
    } catch (e) {
      setErrorMsg(e.message || 'Error updating booking');
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Edit Reservation #{resData.reservation_id || id}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          Update the customer details or status below.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth label="Customer Name" size="medium" required
              value={editBooking.name} onChange={e => setEditBooking({...editBooking, name: e.target.value})}
              sx={{ flexGrow: 2 }}
            />
            <FormControl size="medium" sx={{ flexGrow: 1, minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editBooking.status}
                label="Status"
                onChange={e => setEditBooking({...editBooking, status: e.target.value})}
              >
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth label="Date" type="date" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={editBooking.date} onChange={e => setEditBooking({...editBooking, date: e.target.value})}
            />
            <TextField 
              fullWidth label="Time" type="time" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={editBooking.time} onChange={e => setEditBooking({...editBooking, time: e.target.value})}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth label="Guests" type="number" size="medium" required
              inputProps={{ min: 1 }}
              value={editBooking.guests} onChange={e => setEditBooking({...editBooking, guests: e.target.value})}
            />
            <TextField 
              fullWidth label="Phone (WhatsApp)" size="medium"
              value={editBooking.phone} onChange={e => setEditBooking({...editBooking, phone: e.target.value})}
            />
          </Box>
          
          <TextField 
            fullWidth label="Email Address" size="medium" type="email"
            value={editBooking.email} onChange={e => setEditBooking({...editBooking, email: e.target.value})}
          />
          
          <TextField 
            fullWidth label="Notes / Special Requests" size="medium" multiline rows={3}
            value={editBooking.special_requests} onChange={e => setEditBooking({...editBooking, special_requests: e.target.value})}
          />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
            <Button size="large" onClick={() => navigate('/reservations')} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleSaveBooking} 
              disabled={loading || !editBooking.name || !editBooking.date || !editBooking.time}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
