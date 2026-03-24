import React, { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import { LeftPanel, RightPanelMap, ReservationCheckout, SuccessPage, TermsOfService } from './components';
import { useReservationStore } from './store/useReservationStore';
import { getConfig } from './services/reservationService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Google Style Primary
    },
    background: {
      default: '#ffffff' 
    }
  },
  typography: {
    fontFamily: '"Google Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
           borderRadius: 16,
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
