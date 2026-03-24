import { useState, useEffect } from 'react';
import { Typography, Box, Paper, TextField, Button, Grid, Divider, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function Settings() {
  const [config, setConfig] = useState({
    name: 'Hotaru Madrid',
    address: 'Calle de Alcalá 99, 28009 Madrid',
    minGuests: 1,
    maxGuests: 10
  });
  const [saved, setSaved] = useState(false);

  // Mock saving effect
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box maxWidth="md">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        System Settings
      </Typography>
      
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings successfully updated!
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Restaurant Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These details are displayed on the public reservation frontend.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Restaurant Name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Full Address"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Reservation Rules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure capacities and limits for public bookings.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Minimum Guests per Booking"
              type="number"
              value={config.minGuests}
              onChange={(e) => setConfig({ ...config, minGuests: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Maximum Guests per Booking"
              type="number"
              value={config.maxGuests}
              onChange={(e) => setConfig({ ...config, maxGuests: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ px: 4, py: 1 }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
