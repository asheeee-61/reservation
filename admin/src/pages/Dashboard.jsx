import { Typography, Paper, Grid, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Upcoming Reservations</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Tables Available</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">0</Typography>
            <Typography variant="subtitle1" color="text.secondary">Guests Today</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
