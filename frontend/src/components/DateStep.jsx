import { Box, Button, TextField } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function DateStep({ onNext }) {
  const { date, setDate } = useReservationStore();

  return (
    <Box>
      <TextField
        fullWidth
        type="date"
        label="Select Date"
        InputLabelProps={{ shrink: true }}
        value={date || ''}
        inputProps={{ min: new Date().toISOString().split('T')[0] }}
        onChange={(e) => setDate(e.target.value)}
        sx={{ mb: 3, mt: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={onNext} disabled={!date}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
