import { Typography, Paper, Grid, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Box sx={{ pb: 8 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Upcoming Reservations</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Tables Available</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Guests Today</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
