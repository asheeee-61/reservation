import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UnderConstruction() {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#F1F3F4', // MD2 background
        p: 2 
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            textAlign: 'center', 
            borderRadius: 4, 
            border: '1px solid #E0E0E0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ mb: 4, color: '#1A73E8' }}>
            <span className="material-icons" style={{ fontSize: 80 }}>construction</span>
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Roboto', 
              fontWeight: 700, 
              color: '#202124', 
              mb: 2,
              letterSpacing: '-0.5px'
            }}
          >
            Sitio en Construcción
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'Roboto', 
              color: '#70757A', 
              mb: 6, 
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            Estamos trabajando arduamente para brindarte la mejor experiencia posible. 
            Pronto podrás disfrutar de nuestro nuevo sistema de gestión.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/reservacion')}
              sx={{ 
                bgcolor: '#1A73E8', 
                color: '#FFFFFF',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#1765CC',
                  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
                }
              }}
            >
              Hacer una Reserva
            </Button>
            
            <Typography variant="caption" sx={{ color: '#BDC1C6', mt: 2 }}>
              © {new Date().getFullYear()} Restaurante Premium. Todos los derechos reservados.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
