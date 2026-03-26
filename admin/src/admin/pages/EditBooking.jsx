import { useState } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const STATUS_LABELS = {
  'PENDING': 'Pendiente',
  'CONFIRMED': 'Confirmada',
  'COMPLETED': 'Asistió',
  'NO_SHOW': 'No asistió'
};

const ALLOWED_TRANSITIONS = {
  'PENDING': ['CONFIRMED', 'NO_SHOW'],
  'CONFIRMED': ['COMPLETED', 'NO_SHOW'],
  'COMPLETED': [],
  'NO_SHOW': []
};

export default function EditBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const resData = location.state?.reservation || {};

  const [editBooking, setEditBooking] = useState({
    name: resData.customer?.name || '', 
    phone: resData.customer?.phone || '', 
    email: resData.customer?.email || '', 
    date: resData.date || '', 
    time: resData.time || '', 
    guests: resData.guests || 2, 
    special_requests: resData.special_requests || '',
    status: resData.status?.toUpperCase() || 'PENDING',
    table_type_id: resData.table_type_id || '',
    special_event_id: resData.special_event_id || ''
  });
  const [tableTypes, setTableTypes] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);

  useState(() => {
    const fetchTypesAndEvents = async () => {
      try {
        const [types, events] = await Promise.all([
          apiClient('/admin/table-types'),
          apiClient('/admin/special-events')
        ]);
        setTableTypes(types);
        setSpecialEvents(events);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypesAndEvents();
  }, []);

  const handleSaveBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await apiClient(`/admin/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editBooking)
      });
      navigate('/admin/reservations');
    } catch (e) {
      setErrorMsg(e.message || 'Error updating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Box>
        <Button 
          startIcon={<span className="material-icons">arrow_back</span>} 
          onClick={() => navigate('/admin/reservations')} 
          sx={{ color: '#70757A', textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}
        >
          Back to Reservations
        </Button>
      </Box>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124', mb: '8px' }}>
          Edit Reservation #{resData.reservation_id || id}
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '24px' }}>
          Update the customer details or status below.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: '24px', borderRadius: '4px' }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Customer Name" required
              value={editBooking.name} onChange={e => setEditBooking({...editBooking, name: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flexGrow: 2, minWidth: 200 }}
            />
            <FormControl sx={{ flexGrow: 1, minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>Status</InputLabel>
              <Select
                value={editBooking.status}
                label="Status"
                onChange={e => setEditBooking({...editBooking, status: e.target.value})}
                sx={{ height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' }}
                disabled={ALLOWED_TRANSITIONS[editBooking.status]?.length === 0}
              >
                <MenuItem value={editBooking.status}>{STATUS_LABELS[editBooking.status] || editBooking.status}</MenuItem>
                {(ALLOWED_TRANSITIONS[editBooking.status] || []).map(status => (
                  <MenuItem key={status} value={status} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>
                    {STATUS_LABELS[status] || status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Date" type="date" required
              InputLabelProps={{ shrink: true, sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              value={editBooking.date} onChange={e => setEditBooking({...editBooking, date: e.target.value})}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField 
              label="Time" type="time" required
              InputLabelProps={{ shrink: true, sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              value={editBooking.time} onChange={e => setEditBooking({...editBooking, time: e.target.value})}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Guests" type="number" required
              inputProps={{ min: 1 }}
              value={editBooking.guests} onChange={e => setEditBooking({...editBooking, guests: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField 
              label="Phone (WhatsApp)" 
              value={editBooking.phone} onChange={e => setEditBooking({...editBooking, phone: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Box>
          
          <TextField 
            fullWidth label="Email Address" type="email"
            value={editBooking.email} onChange={e => setEditBooking({...editBooking, email: e.target.value})}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
          />

          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>Tipo de Mesa *</InputLabel>
              <Select
                value={editBooking.table_type_id}
                label="Tipo de Mesa *"
                onChange={e => setEditBooking({...editBooking, table_type_id: e.target.value})}
                sx={{ height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' }}
              >
                {tableTypes.length > 0 ? tableTypes.map(type => (
                  <MenuItem key={type.id} value={type.id} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>
                    {type.name} {!type.is_active && '(Inactivo)'}
                  </MenuItem>
                )) : <MenuItem value={editBooking.table_type_id} sx={{ display: 'none' }} />}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>Evento Especial</InputLabel>
              <Select
                value={editBooking.special_event_id}
                label="Evento Especial"
                onChange={e => setEditBooking({...editBooking, special_event_id: e.target.value})}
                sx={{ height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' }}
              >
                <MenuItem value="" sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>Ninguno</MenuItem>
                {specialEvents.map(event => (
                  <MenuItem key={event.id} value={event.id} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>
                    {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TextField 
            fullWidth label="Notes / Special Requests" multiline rows={3}
            value={editBooking.special_requests} onChange={e => setEditBooking({...editBooking, special_requests: e.target.value})}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
          />

          <Box sx={{ mt: '8px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button 
              onClick={() => navigate('/admin/reservations')} 
              disabled={loading}
              sx={{ color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveBooking} 
              disabled={loading || !editBooking.name || !editBooking.date || !editBooking.time || !editBooking.table_type_id}
              sx={{ 
                height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>

      </Paper>
    </Box>
  );
}
