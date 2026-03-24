import { useState } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Tooltip, IconButton, TextField, InputAdornment, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

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
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Customers Directory
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
          sx={{ maxWidth: 400, width: '100%' }}
        />
      </Paper>

      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell align="center"><strong>Total Visits</strong></TableCell>
              <TableCell><strong>Last Visit</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No customers found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {filtered.map(c => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '1rem' }}>
                      {c.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="500">{c.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{c.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.phone}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 1, fontWeight: 'bold' }}>
                    {c.totalVisits}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{c.lastVisit}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Send WhatsApp">
                    <IconButton size="small" color="success" onClick={() => window.open(`https://wa.me/${c.phone}`, '_blank')}>
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Email">
                    <IconButton size="small" color="primary" onClick={() => window.location.href = `mailto:${c.email}`}>
                      <MailOutlineIcon fontSize="small" />
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
