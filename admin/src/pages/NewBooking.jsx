import { useState } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124', mb: '8px' }}>
          New Manual Booking
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '24px' }}>
          Enter the customer details to block off a table.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: '24px', borderRadius: '4px' }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField 
            fullWidth label="Customer Name" required
            value={newBooking.name} onChange={e => setNewBooking({...newBooking, name: e.target.value})}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
          />
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Date" type="date" required
              InputLabelProps={{ shrink: true, sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField 
              label="Time" type="time" required
              InputLabelProps={{ shrink: true, sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Guests" type="number" required
              inputProps={{ min: 1 }}
              value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField 
              label="Phone (WhatsApp)" 
              value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Box>
          
          <TextField 
            fullWidth label="Notes / Special Requests" multiline rows={3}
            value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
          />

          <Box sx={{ mt: '8px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button 
              onClick={() => navigate('/reservations')} 
              disabled={loading}
              sx={{ color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddBooking} 
              disabled={loading || !newBooking.name || !newBooking.date || !newBooking.time}
              sx={{ 
                height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
              }}
            >
              {loading ? 'Saving...' : 'Save Booking'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
