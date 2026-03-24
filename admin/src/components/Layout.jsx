import { Box, Typography, Button } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/' },
    { text: 'Reservations', icon: 'event', path: '/reservations' },
    { text: 'Customers', icon: 'group', path: '/customers' },
    { text: 'Calendar', icon: 'calendar_month', path: '/calendar' },
    { text: 'Settings', icon: 'settings', path: '/settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box className="app-shell" sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <Box className="sidebar" sx={{
        width: 200, minWidth: 200, height: '100vh', overflowY: 'auto',
        borderRight: '1px solid #E0E0E0', bgcolor: '#FFFFFF',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Logo/Title */}
        <Box sx={{
          display: 'flex', alignItems: 'center', p: '0 16px', height: 56, minHeight: 56,
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
            Restaurant Admin
          </Typography>
        </Box>

        {/* Nav list */}
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Box 
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center', height: 48, px: 2,
                  gap: 1.5, cursor: 'pointer',
                  bgcolor: isActive ? '#E8F0FE' : 'transparent',
                  color: isActive ? '#1A73E8' : '#70757A',
                  borderRight: isActive ? '3px solid #1A73E8' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? '#E8F0FE' : '#F1F3F4'
                  }
                }}
              >
                <span className="material-icons" style={{ fontSize: 20 }}>{item.icon}</span>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>
                  {item.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Main Area */}
      <Box className="main-area" sx={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Top bar */}
        <Box className="top-bar" sx={{
          height: 56, minHeight: 56, borderBottom: '1px solid #E0E0E0',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', bgcolor: '#FFFFFF'
        }}>
          <Button 
            onClick={handleLogout} 
            startIcon={<span className="material-icons">logout</span>}
            sx={{ color: '#70757A', textTransform: 'uppercase', fontWeight: 500, fontSize: '14px' }}
          >
            Logout
          </Button>
        </Box>

        {/* Page content */}
        <Box className="page-content" sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#F1F3F4' }}>
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
}
