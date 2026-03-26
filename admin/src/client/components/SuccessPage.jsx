import { Box, Typography, Button, Container, Divider } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function SuccessPage() {
  const { reservationId, date, selectedSlot, config } = useReservationStore();

  const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

  const whatsappPhone = config?.whatsapp_phone;
  const instagramUsername = config?.instagram_username;
  const showCancellation = whatsappPhone || instagramUsername;


  return (
    <Container maxWidth="xs" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        textAlign: 'center', py: 4, width: '100%'
      }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 3 }}>
          {config?.restaurant?.name || 'Hotaru Madrid'}
        </Typography>
        <span className="material-icons" style={{ fontSize: 48, marginBottom: 16, color: '#1A73E8' }}>check_circle</span>
        
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 500, color: '#202124', mb: 1 }}>
          ¡Reserva confirmada!
        </Typography>
        
        <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 400, color: '#70757A', mb: 4 }}>
          Te esperamos el {formattedDate} a las {selectedSlot?.time}
        </Typography>

        <Box sx={{ mb: 6, p: 2.5, bgcolor: '#F8F9FA', borderRadius: '8px', border: '1px solid #E0E0E0', width: '100%' }}>
          <Typography variant="body2" sx={{ fontSize: '13px', color: '#70757A', textAlign: 'center', lineHeight: 1.5, mb: showCancellation ? 2 : 0 }}>
            <strong>¿Ha cambiado de planes?</strong><br/>
            Por favor, avísenos si decide no venir para que podamos liberar la mesa para otros clientes.
          </Typography>

          {showCancellation && (
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              {whatsappPhone && (
                <Button
                  component="a"
                  href={`https://wa.me/${whatsappPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  fullWidth={!instagramUsername}
                  sx={{ 
                    flex: 1, height: 48, bgcolor: '#25D366', color: '#FFFFFF', borderRadius: '4px',
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'none',
                    boxShadow: 'none', '&:hover': { bgcolor: '#1ebe57', boxShadow: 'none' }
                  }}
                  startIcon={<span className="material-icons" style={{ fontSize: 20 }}>chat</span>}
                >
                  WhatsApp
                </Button>
              )}
              {instagramUsername && (
                <Button
                  component="a"
                  href={`https://instagram.com/${instagramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  fullWidth={!whatsappPhone}
                  sx={{ 
                    flex: 1, height: 48, borderColor: '#E0E0E0', color: '#202124', borderRadius: '4px',
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'none',
                    bgcolor: '#FFFFFF', '&:hover': { borderColor: '#BDBDBD', bgcolor: '#F8F9FA' }
                  }}
                  startIcon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z"/>
                    </svg>
                  }
                >
                  Instagram
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => window.location.href = '/'}
          sx={{ 
            height: 48, borderColor: '#DADCE0', color: '#202124', borderRadius: '4px',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase',
            letterSpacing: '1.25px', '&:hover': { borderColor: '#BDBDBD', bgcolor: '#F8F9FA' },
            mt: 2
          }}
        >
          Volver al inicio
        </Button>
      </Box>
    </Container>
  );
}
