import { Typography, Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';

export default function Reservations() {
  // Mock data for now until connected to Laravel API
  const reservations = [
    { id: '#4812', name: 'John Doe', date: '2026-03-24', time: '19:00', guests: 2, status: 'Confirmed' },
    { id: '#1234', name: 'Jane Smith', date: '2026-03-25', time: '20:30', guests: 4, status: 'Pending' }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reservations
      </Typography>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Date & Time</strong></TableCell>
              <TableCell><strong>Guests</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map(res => (
              <TableRow key={res.id}>
                <TableCell>{res.id}</TableCell>
                <TableCell>{res.name}</TableCell>
                <TableCell>{res.date} at {res.time}</TableCell>
                <TableCell>{res.guests}</TableCell>
                <TableCell>
                  <Chip 
                    label={res.status} 
                    color={res.status === 'Confirmed' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
