import { Box, Button, TextField, Grid } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function DetailsStep({ onNext, onBack }) {
  const { userData, setUserData } = useReservationStore();

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = userData.firstName.trim() && 
                  userData.lastName.trim() && 
                  userData.phone.trim() && 
                  isEmailValid(userData.email);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={userData.firstName}
            onChange={(e) => setUserData({ firstName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={userData.lastName}
            onChange={(e) => setUserData({ lastName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ email: e.target.value })}
            required
            error={userData.email.length > 0 && !isEmailValid(userData.email)}
            helperText={userData.email.length > 0 && !isEmailValid(userData.email) ? "Invalid email" : ""}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone}
            onChange={(e) => setUserData({ phone: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Special Requests (Optional)"
            multiline
            rows={3}
            value={userData.specialRequests}
            onChange={(e) => setUserData({ specialRequests: e.target.value })}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
