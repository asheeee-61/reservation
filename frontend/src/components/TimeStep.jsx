import { useEffect, useState } from 'react';
import { Box, Button, Typography, Grid, Skeleton } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';
import { getAvailableSlots } from '../services/reservationService';

export default function TimeStep({ onNext, onBack }) {
  const { date, guests, selectedTime, setSelectedTime } = useReservationStore();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAvailableSlots(date, guests)
      .then((res) => {
        if (active) {
          setSlots(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [date, guests]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Time
      </Typography>
      
      {loading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1,2,3,4,5,6].map(i => (
             <Grid item xs={4} sm={4} key={i}>
               <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 2 }} />
             </Grid>
          ))}
        </Grid>
      ) : slots.length === 0 ? (
        <Typography color="error" sx={{ mb: 3 }}>
          No availability for this date and party size.
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {slots.map((s, idx) => (
            <Grid item xs={6} sm={4} key={idx}>
              <Button
                fullWidth
                size="large"
                variant={selectedTime === s.time ? "contained" : "outlined"}
                color={selectedTime === s.time ? "primary" : "inherit"}
                disabled={!s.available}
                onClick={() => setSelectedTime(s.time)}
                sx={{ borderRadius: 2 }}
              >
                {s.time}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} disabled={!selectedTime || loading}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
