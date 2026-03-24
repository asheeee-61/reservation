import { useState } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Grid, Alert, Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

export default function NewBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [newBooking, setNewBooking] = useState({
    name: '', phone: '', date: '', time: '', guests: 2, notes: ''
  });

  const handleAddBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Need to hit the base URL for reservations because it's a public endpoint essentially 
      // but admins should also be able to submit bookings. The endpoint is /reservations on base
      const res = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date: newBooking.date,
          slot: { time: newBooking.time },
          guests: newBooking.guests,
          user: {
            name: newBooking.name,
            phone: newBooking.phone,
            email: '',
            specialRequests: newBooking.notes
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          throw new Error(data.errors[firstErrorKey][0]);
        }
        throw new Error(data.message || 'Failed to book');
      }

      navigate('/reservations');
    } catch (e) {
      setErrorMsg(e.message || 'Error saving booking');
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
          New Manual Booking
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          Enter the customer details to block off a table.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TextField 
            fullWidth label="Customer Name" size="medium" required
            value={newBooking.name} onChange={e => setNewBooking({...newBooking, name: e.target.value})}
          />
          
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth label="Date" type="date" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})}
            />
            <TextField 
              fullWidth label="Time" type="time" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth label="Guests" type="number" size="medium" required
              inputProps={{ min: 1 }}
              value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: e.target.value})}
            />
            <TextField 
              fullWidth label="Phone (WhatsApp)" size="medium"
              value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
            />
          </Box>
          
          <TextField 
            fullWidth label="Notes / Special Requests" size="medium" multiline rows={3}
            value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
          />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
            <Button size="large" onClick={() => navigate('/reservations')} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleAddBooking} 
              disabled={loading || !newBooking.name || !newBooking.date || !newBooking.time}
            >
              {loading ? 'Saving...' : 'Save Booking'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
