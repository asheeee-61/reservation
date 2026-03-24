import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, MenuItem, Select, FormControl,
  IconButton, Tooltip, Stack, TextField, InputAdornment, 
  Fab, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const STATUS_COLORS = {
  'pending': 'warning',
  'confirmed': 'info',
  'seated': 'success',
  'completed': 'default',
  'cancelled': 'error'
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
    <Box sx={{ pb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Reservations
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {Object.keys(STATUS_COLORS).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Date & Time</strong></TableCell>
              <TableCell align="center"><strong>Guests</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
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
              <TableRow key={res.id} hover>
                <TableCell>{res.reservation_id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{res.name}</Typography>
                  {res.special_requests && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Note: {res.special_requests}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{res.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{res.time}</Typography>
                </TableCell>
                <TableCell align="center">{res.guests}</TableCell>
                <TableCell>
                  <FormControl size="small" variant="standard">
                    <Select
                      value={res.status}
                      onChange={(e) => handleStatusChange(res.id, e.target.value)}
                      disableUnderline
                      sx={{ 
                        '& .MuiSelect-select': { 
                          py: 0.5, px: 1, 
                          borderRadius: 1,
                          bgcolor: `${STATUS_COLORS[res.status]}.light`,
                          color: `${STATUS_COLORS[res.status]}.dark`,
                          minWidth: 90,
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
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
                        onClick={() => window.open(`https://wa.me/${res.phone}`, '_blank')}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Reservation">
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
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
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/reservations/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
