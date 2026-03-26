import { useState, useEffect, useRef } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Alert, MenuItem, Select, FormControl, InputLabel,
  Popover, IconButton, InputAdornment, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const STATUS_LABELS = {
  'PENDIENTE': 'Pendiente',
  'CONFIRMADA': 'Confirmada',
  'ASISTIÓ': 'Asistió',
  'NO_ASISTIÓ': 'No asistió'
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
    status: resData.status?.toUpperCase() || 'PENDIENTE',
    table_type_id: resData.table_type_id || '',
    special_event_id: resData.special_event_id || ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customersResults, setCustomersResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(resData.customer || null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [tableTypes, setTableTypes] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);

  useEffect(() => {
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

  // Customer search logic (copied from NewBooking)
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomersResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiClient(`/admin/customers?search=${encodeURIComponent(customerSearch)}`);
        const list = data.data ?? data;
        setCustomersResults(list);
        setShowResults(true);
      } catch (err) {
        console.error('Customer search failed:', err);
        setCustomersResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditBooking(prev => ({
      ...prev,
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    }));
    setCustomerSearch('');
    setShowResults(false);
  };

  const handleCreateAsNew = () => {
    setEditBooking(prev => ({
      ...prev,
      name: customerSearch,
      email: '',
      phone: ''
    }));
    setSelectedCustomer(null);
    setCustomerSearch('');
    setShowResults(false);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setEditBooking(prev => ({ ...prev, name: '', email: '', phone: '' }));
    setCustomerSearch('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedCustomer && customerSearch) {
      setEditBooking(prev => ({ ...prev, name: customerSearch }));
    }
  }, [customerSearch, selectedCustomer]);

  const getInitials = (name) => {
    if (!name) return '??';
    const pts = name.split(' ');
    if (pts.length > 1) return (pts[0][0] + pts[pts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' }, position: 'relative' }}>
            <Box sx={{ flexGrow: 2, minWidth: 200, position: 'relative' }} ref={searchRef}>
              {selectedCustomer ? (
                <Box sx={{ p: '8px 12px', border: '1px solid #1A73E8', borderRadius: '4px', bgcolor: '#E8F0FE', display: 'flex', alignItems: 'center', height: 56, boxSizing: 'border-box' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1A73E8', mr: 1.5, fontSize: '14px' }}>
                    {getInitials(selectedCustomer.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1A73E8', lineHeight: 1.2 }}>{selectedCustomer.name}</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#1A73E8', opacity: 0.8 }}>Cliente seleccionado</Typography>
                  </Box>
                  <IconButton size="small" onClick={handleClearSelectedCustomer} sx={{ color: '#1A73E8' }}>
                    <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                  </IconButton>
                </Box>
              ) : (
                <TextField 
                  fullWidth label="Customer Name" required
                  placeholder="Type to search existing or enter new..."
                  value={customerSearch || editBooking.name} 
                  onChange={e => setCustomerSearch(e.target.value)}
                  onFocus={() => customerSearch.length >= 2 && setShowResults(true)}
                  InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                  InputProps={{ 
                    sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' },
                    endAdornment: isSearching ? <CircularProgress size={20} /> : null
                  }}
                />
              )}

              {/* Search Results Popover Simulation (Custom Menu) */}
              {showResults && customersResults.length > 0 && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, mt: 0.5, border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: 300, overflowY: 'auto' }}>
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ bgcolor: '#F1F3F4', py: 1 }}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#70757A', textTransform: 'uppercase' }}>Existing Customers</Typography>
                    </ListItem>
                    {customersResults.map((c) => (
                      <ListItem key={c.id} button onClick={() => handleSelectCustomer(c)} sx={{ borderBottom: '1px solid #F1F3F4' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 36, height: 36 }}>{getInitials(c.name)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</Typography>}
                          secondary={<Typography sx={{ fontSize: '12px', color: '#70757A' }}>{c.phone || c.email || 'No contact details'}</Typography>}
                        />
                        <span className="material-icons" style={{ fontSize: 18, color: '#1A73E8' }}>chevron_right</span>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
            <FormControl sx={{ flexGrow: 1, minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>Status</InputLabel>
              <Select
                value={editBooking.status}
                label="Status"
                onChange={e => setEditBooking({...editBooking, status: e.target.value})}
                sx={{ height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' }}
              >
                {Object.keys(STATUS_LABELS).map(status => (
                  <MenuItem key={status} value={status} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>
                    {STATUS_LABELS[status]}
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
