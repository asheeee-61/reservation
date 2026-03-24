import { useState } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Grid, Alert, Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/reservations')} 
        sx={{ mb: 3 }}
      >
        Back to Reservations
      </Button>

      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          New Manual Booking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter the customer details to block off a table.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField 
              fullWidth label="Customer Name" size="medium" required
              value={newBooking.name} onChange={e => setNewBooking({...newBooking, name: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth label="Date" type="date" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth label="Time" type="time" size="medium" required
              InputLabelProps={{ shrink: true }}
              value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth label="Guests" type="number" size="medium" required
              inputProps={{ min: 1 }}
              value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth label="Phone (WhatsApp)" size="medium"
              value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth label="Notes / Special Requests" size="medium" multiline rows={3}
              value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
