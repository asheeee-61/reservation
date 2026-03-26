import { Box, Typography, Button, Tooltip, IconButton } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { MOBILE, TABLET, DESKTOP } from './utils/breakpoints';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { text: 'Reservations', icon: 'event', path: '/admin/reservations' },
    { text: 'Clientes', icon: 'people', path: '/admin/customers' },
    { text: 'Tipos de Mesa', icon: 'table_restaurant', path: '/admin/table-types' },
    { text: 'Eventos Especiales', icon: 'celebration', path: '/admin/special-events' },
    { text: 'Calendario', icon: 'calendar_month', path: '/admin/calendar' },
    { text: 'Settings', icon: 'settings', path: '/admin/settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = (path) => {
    if (path === '/admin' || path === '/admin/') return 'Dashboard';
    if (path.startsWith('/admin/reservations')) return 'Reservations';
    if (path.startsWith('/admin/customers')) return 'Clientes';
    if (path.startsWith('/admin/table-types')) return 'Tipos de Mesa';
    if (path.startsWith('/admin/special-events')) return 'Eventos Especiales';
    if (path.startsWith('/admin/calendar')) return 'Calendario';
    if (path.startsWith('/admin/settings')) return 'Settings';
    return 'Restaurant Admin';
  };

  return (
    <Box className="app-shell" sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <Box className="sidebar" sx={{
        height: '100vh', overflowY: 'auto', overflowX: 'hidden',
        borderRight: '1px solid #E0E0E0', bgcolor: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        transition: 'width 200ms ease',
        [DESKTOP]: { width: 200, minWidth: 200 },
        [TABLET]: { width: 64, minWidth: 64 },
        [MOBILE]: { width: 56, minWidth: 56 }
      }}>
        {/* Logo/Title */}
        <Box sx={{
          display: 'flex', alignItems: 'center', height: 56, minHeight: 56,
          borderBottom: '1px solid #E0E0E0', 
          [DESKTOP]: { p: '0 16px', justifyContent: 'flex-start' },
          [TABLET]: { justifyContent: 'center' },
          [MOBILE]: { justifyContent: 'center' }
        }}>
          <Typography sx={{ 
            fontFamily: 'Roboto', fontWeight: 500, color: '#1A73E8',
            [DESKTOP]: { fontSize: '14px', color: '#202124' },
            [TABLET]: { fontSize: '16px' },
            [MOBILE]: { fontSize: '16px' }
          }}>
            <Box sx={{ display: 'none', [DESKTOP]: { display: 'block' } }}>Restaurant Admin</Box>
            <Box sx={{ display: 'block', [DESKTOP]: { display: 'none' } }}>R</Box>
          </Typography>
        </Box>

        {/* Nav list */}
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', [DESKTOP]: { alignItems: 'stretch' } }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            const navItem = (
              <Box 
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center', height: 48, cursor: 'pointer',
                  bgcolor: isActive ? '#E8F0FE' : 'transparent',
                  color: isActive ? '#1A73E8' : '#70757A',
                  borderRight: isActive ? '3px solid #1A73E8' : '3px solid transparent',
                  '&:hover': { bgcolor: isActive ? '#E8F0FE' : '#F1F3F4' },
                  [DESKTOP]: { width: '100%', px: 2, justifyContent: 'flex-start', gap: 1.5 },
                  [TABLET]: { width: 64, justifyContent: 'center' },
                  [MOBILE]: { width: 56, justifyContent: 'center' }
                }}
              >
                <span className="material-icons" style={{ fontSize: 20 }}>{item.icon}</span>
                <Typography sx={{ 
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px',
                  display: 'none', [DESKTOP]: { display: 'block' }
                }}>
                  {item.text}
                </Typography>
              </Box>
            );

            return (
              <Tooltip 
                key={item.text}
                title={item.text} 
                placement="right" 
                disableHoverListener={window.innerWidth > 1024} // Tooltip only on tablet/mobile where text is hidden
                componentsProps={{ 
                  tooltip: { sx: { bgcolor: '#323232', color: 'white', fontFamily: 'Roboto', fontSize: '12px', borderRadius: '4px', p: '8px' } }
                }}
              >
                {navItem}
              </Tooltip>
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
          display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF',
          [DESKTOP]: { justifyContent: 'flex-end', px: '24px' },
          [TABLET]: { justifyContent: 'space-between', px: '16px' },
          [MOBILE]: { justifyContent: 'space-between', px: '12px' }
        }}>
          <Typography sx={{ 
            display: 'block', [DESKTOP]: { display: 'none' }, 
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' 
          }}>
            {getPageTitle(location.pathname)}
          </Typography>
          
          <Box sx={{ display: 'none', [DESKTOP]: { display: 'block' } }}>
            <Button 
              onClick={handleLogout} 
              startIcon={<span className="material-icons">logout</span>}
              sx={{ color: '#70757A', textTransform: 'uppercase', fontWeight: 500, fontSize: '14px', minHeight: '44px' }}
            >
              Logout
            </Button>
          </Box>
          <Box sx={{ display: 'block', [DESKTOP]: { display: 'none' } }}>
            <IconButton onClick={handleLogout} sx={{ color: '#70757A', minHeight: '44px', minWidth: '44px' }}>
              <span className="material-icons" style={{ fontSize: 24 }}>logout</span>
            </IconButton>
          </Box>
        </Box>

        {/* Page content */}
        <Box className="page-content" sx={{ 
          flex: 1, overflowY: 'auto', bgcolor: '#F1F3F4',
          [DESKTOP]: { p: '24px' },
          [TABLET]: { p: '16px' },
          [MOBILE]: { p: '12px' }
        }}>
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
}
