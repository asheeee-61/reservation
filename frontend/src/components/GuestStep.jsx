import { Box, Button, TextField } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function GuestStep({ onNext, onBack }) {
  const { guests, setGuests } = useReservationStore();

  return (
    <Box>
      <TextField
        fullWidth
        type="number"
        label="Number of Guests"
        value={guests}
        onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
        inputProps={{ min: 1, max: 20 }}
        sx={{ mb: 3, mt: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} disabled={guests < 1}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
