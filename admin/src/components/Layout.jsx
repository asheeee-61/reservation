import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/' },
    { text: 'Reservations', icon: 'event', path: '/reservations' },
    { text: 'Customers', icon: 'group', path: '/customers' },
    { text: 'Settings', icon: 'settings', path: '/settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#FFFFFF', color: '#202124', borderBottom: '1px solid #E0E0E0', height: 64 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Restaurant Admin
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<span className="material-icons">logout</span>}
            sx={{ color: '#202124', textTransform: 'uppercase' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: '#FFFFFF',
            borderRight: '1px solid #E0E0E0'
          },
        }}
      >
        <Box sx={{ height: 64 }} />
        <Box sx={{ overflow: 'auto', mt: 4 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton 
                key={item.text} 
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#1A73E8' : '#70757A', minWidth: 40 }}>
                  <span className="material-icons">{item.icon}</span>
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 500 : 400,
                    color: location.pathname === item.path ? '#1A73E8' : '#202124'
                  }} 
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 6, bgcolor: '#F1F3F4', minHeight: '100vh' }}>
        <Box sx={{ height: 64 }} />
        <Outlet />
      </Box>
    </Box>
  );
}
