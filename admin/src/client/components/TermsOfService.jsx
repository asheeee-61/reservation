import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReservationStore } from '../store/useReservationStore';

export default function TermsOfService() {
  const { setShowTerms } = useReservationStore();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => setShowTerms(false)}
        sx={{ mb: 4, height: 48, borderRadius: '4px', textTransform: 'none', fontWeight: 500 }}
      >
        Volver a la reserva
      </Button>
      
      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '28px', sm: '36px' }, color: '#202124', mb: 3 }}>
        Términos del Servicio
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '8px', mb: 4, border: '1px solid #DADCE0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', mb: 1.5, color: '#202124' }}>
          1. Aceptación de los Términos
        </Typography>
        <Typography variant="body1" sx={{ color: '#70757A', mb: 4, fontSize: '15px', lineHeight: 1.6 }}>
          Al realizar una reserva, usted acepta quedar vinculado por estos Términos del Servicio. Si no está de acuerdo con estos términos, no utilice nuestro sistema de reservas.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', mb: 1.5, color: '#202124' }}>
          2. Políticas de Reserva
        </Typography>
        <Typography variant="body1" sx={{ color: '#70757A', mb: 4, fontSize: '15px', lineHeight: 1.6 }}>
          Las reservas se mantienen durante un máximo de 15 minutos después de la hora programada. Si su grupo llega tarde, nos reservamos el derecho de ceder su mesa a otros clientes en espera.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', mb: 1.5, color: '#202124' }}>
          3. Cancelaciones
        </Typography>
        <Typography variant="body1" sx={{ color: '#70757A', mb: 4, fontSize: '15px', lineHeight: 1.6 }}>
          Por favor, avísenos con al menos 24 horas de antelación si necesita cancelar o modificar su reserva. Las incomparecencias repetidas sin cancelación pueden dar lugar a restricciones en futuras reservas.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', mb: 1.5, color: '#202124' }}>
          4. Privacidad de Datos
        </Typography>
        <Typography variant="body1" sx={{ color: '#70757A', mb: 2, fontSize: '15px', lineHeight: 1.6 }}>
          Su información de contacto, incluyendo su nombre completo, correo electrónico y número de teléfono registrado en WhatsApp, se almacena de forma segura. Utilizamos esta información exclusivamente para confirmar y gestionar su reserva. Nunca compartimos sus datos con terceros.
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          fullWidth
          onClick={() => setShowTerms(false)}
          sx={{ 
            borderRadius: '4px', 
            height: 56, 
            px: 6, 
            fontSize: '15px', 
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          Entendido y Volver
        </Button>
      </Box>
    </Container>
  );
}
