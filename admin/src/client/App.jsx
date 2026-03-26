import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress, Fade } from '@mui/material';
import { LeftPanel, RightPanelMap, TableTypeSelection, SpecialEventSelection, ReservationCheckout, SuccessPage, TermsOfService } from './components';
import { useReservationStore } from './store/useReservationStore';
import { getConfig } from './services/reservationService';

const theme = createTheme({
  spacing: 4,
  palette: {
    primary: { main: '#1A73E8', contrastText: '#FFFFFF' },
    secondary: { main: '#70757A', contrastText: '#ffffff' },
    error: { main: '#D93025' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: { primary: '#202124', secondary: '#70757A' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 500, fontSize: '18px', color: '#202124' },
    h6: { fontWeight: 500, fontSize: '18px', color: '#202124' },
    subtitle1: { fontWeight: 400, fontSize: '14px', color: '#70757A' },
    subtitle2: { fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' },
    body1: { fontWeight: 400, fontSize: '14px', color: '#202124' },
    body2: { fontWeight: 400, fontSize: '14px', color: '#70757A' },
    button: { fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          color: '#202124'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          backgroundImage: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          transition: 'all 200ms ease',
        },
        containedPrimary: {
          backgroundColor: '#1A73E8',
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#1557B0',
            boxShadow: 'none',
          }
        }
      }
    }
  }
});

function App() {
  const { config, setConfig, showTerms } = useReservationStore();
  const [initLoading, setInitLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (config) {
      setInitLoading(false);
      return;
    }
    getConfig().then((cfg) => {
      setConfig(cfg);
      setInitLoading(false);
    });
  }, [setConfig, config]);

  if (initLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (showTerms) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TermsOfService />
      </ThemeProvider>
    );
  }

  const isStepWithMap = !['/confirmar', '/exito'].includes(location.pathname);
  
  // Adjusted for potential /reservacion prefix in master router
  const currentSubPath = location.pathname.replace('/reservacion', '');
  const isMapVisible = !['/confirmar', '/exito'].includes(currentSubPath) && currentSubPath !== '/confirmar' && currentSubPath !== '/exito';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
        
        {/* Left Side: Scrollable content */}
        <Box sx={{ 
          flex: isMapVisible ? { xs: '1 1 100%', md: '0 0 40%', lg: '0 0 35%' } : '1 1 100%',
          height: '100vh',
          overflowY: 'auto',
          position: 'relative',
          bgcolor: isMapVisible ? '#FFFFFF' : 'grey.50'
        }}>
          <Routes>
            <Route path="/" element={<LeftPanel onContinue={() => navigate('mesa')} />} />
            <Route path="/reservar" element={<LeftPanel onContinue={() => navigate('mesa')} />} />
            <Route path="/mesa" element={<TableTypeSelection onBack={() => navigate(-1)} onContinue={() => navigate('/reservacion/evento')} />} />
            <Route path="/evento" element={<SpecialEventSelection onBack={() => navigate(-1)} onContinue={() => navigate('/reservacion/confirmar')} />} />
            <Route path="/confirmar" element={<ReservationCheckout onBack={() => navigate(-1)} onSuccess={() => navigate('/reservacion/exito')} />} />
            <Route path="/exito" element={<SuccessPage />} />
          </Routes>
        </Box>

        {/* Right Side: Persistent Map (Hidden on mobile) */}
        {isMapVisible && (
          <Box sx={{ 
            display: { xs: 'none', md: 'block' }, 
            flex: '1 1 auto', 
            height: '100vh',
            borderLeft: '1px solid #E0E0E0'
          }}>
            <RightPanelMap />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

// Step-specific wrappers are now handled by the main layout in App()

export default App;

