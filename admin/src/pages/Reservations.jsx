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
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';

const STATUS_COLORS = {
  'pending': 'warning',
  'confirmed': 'info',
  'cancelled': 'error',
  'no_show': 'secondary'
};

const CHIP_COLORS = {
  'pending': { bg: '#FEF7E0', text: '#7D4A00' },
  'confirmed': { bg: '#E6F4EA', text: '#137333' },
  'cancelled': { bg: '#FDECEA', text: '#C5221F' },
  'no_show': { bg: '#FDECEA', text: '#C5221F' }
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
    const matchesSearch = res.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || res.reservation_id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ 
          fontFamily: 'Roboto', fontWeight: 500, color: '#202124',
          [DESKTOP]: { fontSize: '20px' },
          [TABLET]: { fontSize: '18px' },
          [MOBILE]: { fontSize: '16px' }
        }}>
          Reservations
        </Typography>
      </Box>

      {/* FILTERS */}
      <Paper sx={{ 
        p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', 
        display: 'flex', 
        [DESKTOP]: { gap: '16px', flexDirection: 'row' },
        [TABLET]: { gap: '16px', flexDirection: 'row' },
        [MOBILE]: { gap: '8px', flexDirection: 'column', p: '16px' }
      }}>
        <TextField
          size="small"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' } 
            }
          }}
          sx={{ 
            flexGrow: 1, 
            [DESKTOP]: { maxWidth: 400 },
            [TABLET]: { maxWidth: 400 },
            [MOBILE]: { width: '100%', maxWidth: 'none', height: 52 }
          }}
        />
        <FormControl size="small" sx={{ 
          [DESKTOP]: { minWidth: 150 },
          [TABLET]: { minWidth: 150 },
          [MOBILE]: { width: '100%', minWidth: '100%' }
        }}>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' }
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {Object.keys(STATUS_COLORS).map(s => (
              <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* DESKTOP & TABLET TABLE VIEW */}
      <Paper sx={{ 
        display: 'none', [DESKTOP]: { display: 'block' }, [TABLET]: { display: 'block' },
        overflowX: 'auto', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' 
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>ID</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Customer</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Date & Time</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Guests</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell></TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No reservations found.</Typography></TableCell></TableRow>
            ) : filteredReservations.map(res => (
              <TableRow 
                key={res.id} 
                hover
                onClick={() => navigate(`/reservations/view/${res.id}`, { state: { reservation: res } })}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.reservation_id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{res.customer?.name || 'N/A'}</Typography>
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
                          fontFamily: 'Roboto',
                          textTransform: 'uppercase'
                        }
                      }}
                    >
                      {Object.keys(STATUS_COLORS).map(s => (
                        <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
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
                          window.open(`https://wa.me/${res.customer?.phone}`, '_blank');
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

      {/* MOBILE CARD VIEW */}
      <Box sx={{ 
        display: 'none', flexDirection: 'column', gap: '8px',
        [MOBILE]: { display: 'flex' }
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>
        ) : filteredReservations.length === 0 ? (
          <Box display="flex" justifyContent="center" py={3}><Typography color="text.secondary">No reservations found.</Typography></Box>
        ) : filteredReservations.map(res => {
          const chipColor = CHIP_COLORS[res.status?.toLowerCase()] || { bg: '#F1F3F4', text: '#202124' };
          return (
            <Paper 
              key={res.id}
              onClick={() => navigate(`/reservations/view/${res.id}`, { state: { reservation: res } })}
              sx={{ 
                p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF', boxShadow: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                  #{res.reservation_id}
                </Typography>
                <Box sx={{ bgcolor: chipColor.bg, color: chipColor.text, borderRadius: '4px', px: '8px', py: '4px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {res.status || 'Pending'}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>
                {res.date} · {res.time}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {res.guests} personas · {res.table_type || 'General'}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#1A73E8', mt: '4px' }}>
                Cliente: {res.customer?.name || 'N/A'} →
              </Typography>
            </Paper>
          );
        })}
      </Box>

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
