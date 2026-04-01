import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import ViewBooking from './pages/ViewBooking';
import NewBooking from './pages/NewBooking';
import EditBooking from './pages/EditBooking';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Zones from './pages/Zones';
import Events from './pages/Events';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import CalendarPanel from './pages/CalendarPanel';
import SchedulePanel from './pages/SchedulePanel';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import { ErrorBoundary } from './components/ErrorBoundary';

const theme = createTheme({
  spacing: 4,
  palette: {
    primary: { main: '#1A73E8', contrastText: '#FFFFFF' },
    secondary: { main: '#70757A', contrastText: '#ffffff' },
    error: { main: '#D93025' },
    background: { default: '#F1F3F4', paper: '#FFFFFF' },
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
          backgroundColor: '#F1F3F4',
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
          padding: '16px'
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
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          height: 48,
          borderRadius: 4,
          margin: '0 8px',
          padding: '0 16px',
          '&.Mui-selected': {
            backgroundColor: '#E8F0FE',
            color: '#1A73E8',
            '&:hover': {
              backgroundColor: '#E8F0FE',
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
          }
        }
      }
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          borderRadius: 28,
          backgroundColor: '#1A73E8',
          color: '#FFFFFF',
          transition: 'all 200ms ease',
          '&:hover': {
            backgroundColor: '#1557B0',
          }
        }
      }
    }
  }
});

// Guarded Route component
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="reservations" element={<ErrorBoundary><Reservations /></ErrorBoundary>} />
          <Route path="reservations/view/:id" element={<ErrorBoundary><ViewBooking /></ErrorBoundary>} />
          <Route path="reservations/new" element={<ErrorBoundary><NewBooking /></ErrorBoundary>} />
          <Route path="reservations/edit/:id" element={<ErrorBoundary><EditBooking /></ErrorBoundary>} />
          <Route path="customers" element={<ErrorBoundary><Customers /></ErrorBoundary>} />
          <Route path="customers/:id" element={<ErrorBoundary><CustomerDetail /></ErrorBoundary>} />
          <Route path="zones" element={<ErrorBoundary><Zones /></ErrorBoundary>} />
          <Route path="events" element={<ErrorBoundary><Events /></ErrorBoundary>} />
          <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
          <Route path="calendar" element={<ErrorBoundary><CalendarPanel /></ErrorBoundary>} />
          <Route path="schedule" element={<ErrorBoundary><SchedulePanel /></ErrorBoundary>} />
        </Route>
        {/* Redirect any other /admin/* to /admin/ */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

