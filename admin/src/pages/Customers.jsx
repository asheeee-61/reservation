import { useState } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Tooltip, IconButton, TextField, InputAdornment, Avatar
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', totalVisits: 5, lastVisit: '2026-03-20' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', totalVisits: 2, lastVisit: '2026-03-15' },
  { id: 3, name: 'Alex Johnson', email: 'alex@example.com', phone: '5551234567', totalVisits: 12, lastVisit: '2026-03-22' }
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '24px', color: '#202124' }}>
        Customers Directory
      </Typography>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <TextField
          size="small"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { borderRadius: '4px', fontFamily: 'Roboto' }
          }}
          sx={{ maxWidth: 400, width: '100%' }}
        />
      </Paper>

      <Paper sx={{ overflow: 'hidden', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Customer</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Contact</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Total Visits</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Last Visit</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
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
                    <Avatar sx={{ bgcolor: '#1A73E8', width: 32, height: 32, fontSize: '14px', fontFamily: 'Roboto', fontWeight: 500 }}>
                      {c.name.charAt(0)}
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
                    {c.totalVisits}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{c.lastVisit}</Typography>
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
    </Box>
  );
}
