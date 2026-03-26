import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Tooltip, IconButton, TextField, InputAdornment, Avatar
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { apiClient } from '../services/apiClient';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiClient('/admin/customers');
      setCustomers(data.data || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography sx={{ 
        fontFamily: 'Roboto', fontWeight: 500, color: '#202124',
        [DESKTOP]: { fontSize: '20px' },
        [TABLET]: { fontSize: '18px' },
        [MOBILE]: { fontSize: '16px' }
      }}>
        Customers Directory
      </Typography>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', [MOBILE]: { p: '16px' } }}>
        <TextField
          size="small"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' }
            }
          }}
          sx={{ width: '100%', [DESKTOP]: { maxWidth: 400 }, [TABLET]: { maxWidth: 400 } }}
        />
      </Paper>

      {/* DESKTOP & TABLET TABLE VIEW */}
      <Paper sx={{ 
        display: 'none', [DESKTOP]: { display: 'block' }, [TABLET]: { display: 'block' },
        overflowX: 'auto', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' 
      }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Customer</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Contact</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Total Visits</TableCell>
              <TableCell sx={{ 
                fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px',
                [TABLET]: { display: 'none' } 
              }}>Last Visit</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Loading...</TableCell></TableRow>}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary" sx={{ fontFamily: 'Roboto' }}>No customers found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {filtered.map(c => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Avatar sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', width: 32, height: 32, fontSize: '14px', fontFamily: 'Roboto', fontWeight: 500 }}>
                      {getInitials(c.name)}
                    </Avatar>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{c.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{c.email}</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{c.phone}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, bgcolor: '#F1F3F4', borderRadius: '4px', fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#202124' }}>
                    {c.total_reservations || 0}
                  </Box>
                </TableCell>
                <TableCell sx={{ [TABLET]: { display: 'none' } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{c.last_visit || 'Never'}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Send WhatsApp">
                    <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${c.phone}`, '_blank'); }}>
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Email">
                    <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${c.email}`; }}>
                      <span className="material-icons" style={{ fontSize: 20 }}>mail</span>
                    </IconButton>
                  </Tooltip>
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
        {!loading && filtered.length === 0 && (
          <Box display="flex" justifyContent="center" py={3}><Typography color="text.secondary">No customers found.</Typography></Box>
        )}
        {filtered.map(c => (
          <Paper 
            key={c.id}
            sx={{ 
              p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0', 
              bgcolor: '#FFFFFF', boxShadow: 'none',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '4px' }}>
              <Avatar sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', width: 36, height: 36, fontSize: '14px', fontFamily: 'Roboto', fontWeight: 500 }}>
                {getInitials(c.name)}
              </Avatar>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                {c.name}
              </Typography>
            </Box>
            
            <Box sx={{ pl: '48px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {c.email || '—'}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {c.phone || '—'}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px' }}>
                {c.total_reservations || 0} reservas · {c.last_visit || 'Never'}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

    </Box>
  );
}
