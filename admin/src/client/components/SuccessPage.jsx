import { Box, Typography, Button, Container } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function SuccessPage() {
  const { reservationId, date, selectedSlot, reset } = useReservationStore();

  const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

  return (
    <Container maxWidth="xs" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        textAlign: 'center', py: 4, width: '100%'
      }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 3 }}>
          {useReservationStore.getState().config?.restaurant?.name || 'Hotaru Madrid'}
        </Typography>
        <span className="material-icons" style={{ fontSize: 48, marginBottom: 16, color: '#1A73E8' }}>check_circle</span>
        
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 500, color: '#202124', mb: 1 }}>
          ¡Reserva confirmada!
        </Typography>
        
        <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 400, color: '#70757A', mb: 4 }}>
          Te esperamos el {formattedDate} a las {selectedSlot?.time}
        </Typography>

        <Box sx={{ mb: 6 }} />

        <Button 
          variant="outlined" 
          fullWidth
          onClick={reset}
          sx={{ 
            borderRadius: '4px', height: 56,
            color: '#1A73E8', borderColor: '#1A73E8',
            fontWeight: 600, textTransform: 'uppercase',
            fontSize: '15px',
            '&:hover': { borderColor: '#1557B0', bgcolor: 'rgba(26, 115, 232, 0.04)' }
          }}
        >
          Volver al inicio
        </Button>
      </Box>
    </Container>
  );
}
