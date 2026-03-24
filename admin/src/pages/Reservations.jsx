import { useState } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, MenuItem, Select, FormControl,
  IconButton, Tooltip, Stack, TextField, InputAdornment, 
  Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const MOCK_RESERVATIONS = [
  { id: '#4813', name: 'John Doe', phone: '1234567890', date: '2026-03-24', time: '19:00', guests: 2, status: 'Confirmed', notes: 'Anniversary' },
  { id: '#1234', name: 'Jane Smith', phone: '0987654321', date: '2026-03-24', time: '20:30', guests: 4, status: 'Pending', notes: '' },
  { id: '#5678', name: 'Alex Johnson', phone: '5551234567', date: '2026-03-25', time: '19:30', guests: 1, status: 'Seated', notes: 'Allergy: Peanuts' }
];

const STATUS_COLORS = {
  'Pending': 'warning',
  'Confirmed': 'info',
  'Seated': 'success',
  'Completed': 'default',
  'Cancelled': 'error',
  'No Show': 'error'
};

export default function Reservations() {
  const [reservations, setReservations] = useState(MOCK_RESERVATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  
  const [newBooking, setNewBooking] = useState({
    name: '', phone: '', date: '', time: '', guests: 2, notes: ''
  });

  const handleStatusChange = (id, newStatus) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status: newStatus } : res
    ));
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddBooking = () => {
    setReservations([{
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
      ...newBooking,
      status: 'Confirmed'
    }, ...reservations]);
    setOpenDialog(false);
    setNewBooking({ name: '', phone: '', date: '', time: '', guests: 2, notes: '' });
  };

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
            <MenuItem value="All">All Statuses</MenuItem>
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
            {filteredReservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No reservations found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredReservations.map(res => (
              <TableRow key={res.id} hover>
                <TableCell>{res.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{res.name}</Typography>
                  {res.notes && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Note: {res.notes}
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
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Manual Booking</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Customer Name" size="small" required
                value={newBooking.name} onChange={e => setNewBooking({...newBooking, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Date" type="date" size="small" required
                InputLabelProps={{ shrink: true }}
                value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Time" type="time" size="small" required
                InputLabelProps={{ shrink: true }}
                value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Guests" type="number" size="small" required
                value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Phone (WhatsApp)" size="small"
                value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Notes / Special Requests" size="small" multiline rows={2}
                value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBooking} disabled={!newBooking.name || !newBooking.date || !newBooking.time}>
            Save Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
