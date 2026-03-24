import React from 'react';
import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Box } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReservationStepper from './components/ReservationStepper';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#fdfdfd'
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0} color="primary" sx={{ backgroundImage: 'linear-gradient(to right, #e91e63, #ff5252)' }}>
        <Toolbar>
          <RestaurantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
             La Trattoria
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: '100vh', pb: 5 }}>
        <ReservationStepper />
      </Box>
    </ThemeProvider>
  );
}

export default App;
