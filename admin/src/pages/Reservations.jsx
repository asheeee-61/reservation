import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, MenuItem, Select, FormControl,
  IconButton, Tooltip, Stack, TextField, InputAdornment, 
  Fab, CircularProgress
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const STATUS_COLORS = {
  'pending': 'warning',
  'confirmed': 'info',
  'cancelled': 'error',
  'no_show': 'secondary'
};

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await apiClient('/admin/reservations');
      setReservations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // optimistic update
    const previous = [...reservations];
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status: newStatus } : res
    ));

    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      alert('Failed to update status');
      setReservations(previous);
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.reservation_id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '24px', color: '#202124' }}>
          Reservations
        </Typography>
      </Box>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', display: 'flex', gap: '16px' }}>
        <TextField
          size="small"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { borderRadius: '4px', fontFamily: 'Roboto' }
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ borderRadius: '4px', fontFamily: 'Roboto' }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {Object.keys(STATUS_COLORS).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ overflow: 'hidden', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>ID</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Customer</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Date & Time</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Guests</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No reservations found.</Typography>
                </TableCell>
              </TableRow>
            ) : filteredReservations.map(res => (
              <TableRow 
                key={res.id} 
                hover
                onClick={() => navigate(`/reservations/view/${res.id}`, { state: { reservation: res } })}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.reservation_id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{res.name}</Typography>
                  {res.special_requests && (
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mt: '2px' }} display="block">
                      Note: {res.special_requests}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.date}</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{res.time}</Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.guests}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <FormControl size="small" variant="standard">
                    <Select
                      value={res.status}
                      onChange={(e) => handleStatusChange(res.id, e.target.value)}
                      disableUnderline
                      sx={{ 
                        '& .MuiSelect-select': { 
                          py: 0.5, px: 1, 
                          borderRadius: '4px',
                          bgcolor: STATUS_COLORS[res.status] ? `${STATUS_COLORS[res.status]}.light` : 'grey.200',
                          color: STATUS_COLORS[res.status] ? `${STATUS_COLORS[res.status]}.dark` : 'grey.800',
                          minWidth: 90,
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: 500,
                          fontFamily: 'Roboto'
                        }
                      }}
                    >
                      {Object.keys(STATUS_COLORS).map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Message on WhatsApp">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/${res.phone}`, '_blank');
                        }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Reservation">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reservations/edit/${res.id}`, { state: { reservation: res } });
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 20 }}>edit</span>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' }, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        onClick={() => navigate('/reservations/new')}
      >
        <span className="material-icons">add</span>
      </Fab>
    </Box>
  );
}
