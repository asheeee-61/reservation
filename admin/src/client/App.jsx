import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress, Fade } from '@mui/material';
import { LeftPanel, RightPanelMap, TableTypeSelection, SpecialEventSelection, ReservationCheckout, SuccessPage, TermsOfService } from './components';
import { useReservationStore } from './store/useReservationStore';
import { getConfig, getTableTypes, getSpecialEvents } from './services/reservationService';

const ProgressIndicator = ({ step }) => {
  const steps = ['selection', 'table_selection', 'special_event', 'confirmation'];
  const currentIndex = steps.indexOf(step);
  if (currentIndex === -1) return null;

  return (
    <Box sx={{ width: '100%', pt: 1, pb: 4, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 300 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <Box sx={{ 
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: i <= currentIndex ? '#1A73E8' : '#E0E0E0',
              ...(i === currentIndex && {
                border: '3px solid #E8F0FE',
                outline: '1.5px solid #1A73E8',
                width: 16, height: 16, // larger for the ring effect
                mx: -0.75
              }),
              transition: 'all 0.3s ease',
              zIndex: 2
            }} />
            {i < steps.length - 1 && (
              <Box sx={{ 
                flexGrow: 1, height: 2, 
                bgcolor: i < currentIndex ? '#1A73E8' : '#E0E0E0',
                transition: 'all 0.3s ease'
              }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

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
  const { 
    config, setConfig, showTerms, step, setStep,
    setTableTypes, setSpecialEvents
  } = useReservationStore();
  const [initLoading, setInitLoading] = useState(true);
  
  useEffect(() => {
    const initApp = async () => {
      try {
        const [cfg, types, events] = await Promise.all([
          getConfig(),
          getTableTypes(),
          getSpecialEvents()
        ]);
        setConfig(cfg);
        setTableTypes(types.filter(t => t.is_active));
        setSpecialEvents(events.filter(e => e.is_active));
      } catch (e) {
        console.error('Initialization failed', e);
      } finally {
        setInitLoading(false);
      }
    };
    initApp();
  }, [setConfig, setTableTypes, setSpecialEvents]);

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

  const isMapVisible = step !== 'confirmation' && step !== 'success';

  const autoAdvance = (nextStep) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setTimeout(() => {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  };

  const renderStep = (targetStep, Component, props = {}) => (
    <Box sx={{ 
      display: step === targetStep ? 'flex' : 'none',
      flexDirection: 'column',
      opacity: step === targetStep ? 1 : 0,
      visibility: step === targetStep ? 'visible' : 'hidden',
      transition: 'opacity 200ms ease',
      height: '100%',
      width: '100%'
    }}>
      {targetStep !== 'success' && <ProgressIndicator step={step} />}
      <Component {...props} />
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        width: '100%', 
        minHeight: '100vh', 
        overflow: { xs: 'auto', md: 'hidden' } 
      }}>
        
        {/* Left Side: Step Content */}
        <Box sx={{ 
          flex: isMapVisible ? { xs: '1 1 auto', md: '0 0 40%', lg: '0 0 35%' } : '1 1 auto',
          height: { xs: 'auto', md: '100vh' },
          overflowY: { xs: 'visible', md: 'auto' },
          position: 'relative',
          bgcolor: isMapVisible ? '#FFFFFF' : 'grey.50'
        }}>
          {renderStep('selection', LeftPanel, { onAutoAdvance: () => autoAdvance('table_selection') })}
          {renderStep('table_selection', TableTypeSelection, { onBack: () => setStep('selection'), onAutoAdvance: () => autoAdvance('special_event') })}
          {renderStep('special_event', SpecialEventSelection, { onBack: () => setStep('table_selection'), onAutoAdvance: () => autoAdvance('confirmation') })}
          {renderStep('confirmation', ReservationCheckout, { onBack: () => setStep('special_event'), onSuccess: () => setStep('success') })}
          {renderStep('success', SuccessPage)}
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

