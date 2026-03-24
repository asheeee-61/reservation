import React, { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import { LeftPanel, RightPanelMap, ReservationCheckout, SuccessPage, TermsOfService } from './components';
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
  const { config, setConfig, reservationId, showTerms } = useReservationStore();
  const [initLoading, setInitLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    getConfig().then((cfg) => {
      setConfig(cfg);
      setInitLoading(false);
    });
  }, [setConfig]);

  if (initLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleSuccess = () => {
    setShowCheckout(false);
  };

  if (showTerms) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TermsOfService />
      </ThemeProvider>
    );
  }

  if (reservationId) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SuccessPage />
      </ThemeProvider>
    );
  }

  if (showCheckout) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReservationCheckout 
          onBack={() => setShowCheckout(false)} 
          onSuccess={handleSuccess} 
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', width: '100%' }}>
        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 40%', lg: '0 0 35%' }, height: { md: '100vh' } }}>
          <LeftPanel onContinue={() => setShowCheckout(true)} />
        </Box>
        <Box sx={{ flex: '1 1 auto', height: { xs: '300px', md: '100vh' } }}>
          <RightPanelMap />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
