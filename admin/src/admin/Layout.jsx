import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';
import { MOBILE, TABLET, DESKTOP } from './utils/breakpoints';
import GlobalSearch from './components/GlobalSearch';
import QuickActions from './components/QuickActions';
import CopyLinksDropdown from './components/CopyLinksDropdown';
import WhatsAppStatus from './components/WhatsAppStatus';
import RestaurantLogo from '../shared/RestaurantLogo';
import { ConfirmModal } from './components/ConfirmModal';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const globalHours = useSettingsStore(state => state.globalHours);
  const [logoutModal, setLogoutModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const menuItems = [
    { text: 'Calendario',   icon: 'calendar_month',    path: '/admin/calendar' },
    { text: 'Reservas',     icon: 'event',             path: '/admin/reservations' },
    { text: 'Panel principal',icon: 'dashboard',       path: '/admin' },
    { text: 'Clientes',     icon: 'people',            path: '/admin/customers' },
    { text: 'Zonas',         icon: 'map',               path: '/admin/zones' },
    { text: 'Eventos',       icon: 'celebration',  path: '/admin/events' },
    { text: 'Horarios',     icon: 'schedule',          path: '/admin/schedule' },
    { text: 'Ajustes',      icon: 'settings',          path: '/admin/settings' },
    { text: 'Mi perfil',    icon: 'account_circle',    path: '/admin/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = (path) => {
    if (path === '/admin' || path === '/admin/') return 'Panel principal';
    if (path.startsWith('/admin/reservations')) return 'Reservas';
    if (path.startsWith('/admin/customers')) return 'Clientes';
    if (path.startsWith('/admin/zones')) return 'Zonas';
    if (path.startsWith('/admin/events')) return 'Eventos';
    if (path.startsWith('/admin/calendar')) return 'Calendario';
    if (path.startsWith('/admin/schedule')) return 'Control de horarios';
    if (path.startsWith('/admin/settings')) return 'Ajustes';
    if (path.startsWith('/admin/profile')) return 'Mi perfil';
    return 'Panel de administración';
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          [DESKTOP]: { p: '0 16px', justifyContent: 'flex-start', gap: 1.5 },
          [TABLET]: { justifyContent: 'center' },
          [MOBILE]: { justifyContent: 'center' }
        }}>
          <RestaurantLogo
            logoUrl={globalHours?.logo_url}
            restaurantName="Hotaru Madrid"
            size={32}
          />
          <Typography component="div" sx={{ 
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124',
            display: 'none', [DESKTOP]: { display: 'block' }
          }}>
            Panel de administración
          </Typography>
        </Box>

        {/* Nav list */}
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', [DESKTOP]: { alignItems: 'stretch' } }}>
          {menuItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? (location.pathname === '/admin' || location.pathname === '/admin/') 
              : location.pathname.startsWith(item.path);
            
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
                disableHoverListener={window.innerWidth > 1024}
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
          px: '24px', gap: '12px',
        }}>
          {/* Mobile: page title */}
          <Typography sx={{ 
            display: 'block', [DESKTOP]: { display: 'none' }, 
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124',
            flex: 1, minWidth: 0,
          }}>
            {getPageTitle(location.pathname)}
          </Typography>

          {/* Desktop: Global Search */}
          <Box sx={{ display: 'none', [DESKTOP]: { display: 'flex' }, flex: 1, minWidth: 0, maxWidth: 500, ml: { lg: '24px' } }}>
            <GlobalSearch />
          </Box>

          {/* Right side: Quick Actions + User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, ml: 'auto' }}>
            {/* Quick action buttons — desktop only */}
            <Box sx={{ display: 'none', [DESKTOP]: { display: 'flex' } }}>
              <QuickActions />
            </Box>

            {/* Copy links dropdown — desktop only */}
            <Box sx={{ display: 'none', [DESKTOP]: { display: 'block' } }}>
              <CopyLinksDropdown />
            </Box>

            {/* WhatsApp Connection Status */}
            <WhatsAppStatus />

            {/* User menu — desktop */}
            <Box ref={userMenuRef} sx={{ display: 'none', [DESKTOP]: { display: 'block' }, position: 'relative' }}>
              <Box
                onClick={() => setUserMenuOpen(o => !o)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '6px', height: 36,
                  px: '8px', borderRadius: '4px', cursor: 'pointer',
                  '&:hover': { bgcolor: '#F1F3F4' },
                }}
              >
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: 18, color: '#1A73E8' }}>person</span>
                </Box>
                <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>
                  {userMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </Box>

              {userMenuOpen && (
                <Box sx={{
                  position: 'absolute', top: '48px', right: 0,
                  width: 200, bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0E0', borderRadius: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)', zIndex: 1300, py: '4px',
                }}>
                  {[
                    { label: 'Mi perfil', icon: 'person', action: () => { setUserMenuOpen(false); navigate('/admin/profile'); } },
                    { label: 'Ajustes',  icon: 'settings', action: () => { setUserMenuOpen(false); navigate('/admin/settings'); } },
                  ].map(item => (
                    <Box key={item.label} onClick={item.action} sx={{
                      display: 'flex', alignItems: 'center', height: 40, px: '12px', gap: '12px',
                      cursor: 'pointer', '&:hover': { bgcolor: '#F1F3F4' },
                    }}>
                      <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>{item.icon}</span>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: 14, color: '#202124' }}>{item.label}</Typography>
                    </Box>
                  ))}

                  {/* Divider */}
                  <Box sx={{ borderTop: '1px solid #E0E0E0', my: '4px' }} />

                  {/* Cerrar sesión */}
                  <Box onClick={() => { setUserMenuOpen(false); setLogoutModal(true); }} sx={{
                    display: 'flex', alignItems: 'center', height: 40, px: '12px', gap: '12px',
                    cursor: 'pointer', '&:hover': { bgcolor: '#FDE8E8' },
                  }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#D93025' }}>logout</span>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: 14, fontWeight: 500, color: '#D93025' }}>
                      Cerrar sesión
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Mobile: logout icon */}
            <Box sx={{ display: 'block', [DESKTOP]: { display: 'none' } }}>
              <IconButton onClick={() => setLogoutModal(true)} sx={{ color: '#70757A', minHeight: '44px', minWidth: '44px' }}>
                <span className="material-icons" style={{ fontSize: 24 }}>logout</span>
              </IconButton>
            </Box>
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

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={logoutModal}
        title="Cerrar sesión"
        body="¿Quieres salir del panel de administración?"
        confirmLabel="CERRAR SESIÓN"
        confirmColor="#D93025"
        onCancel={() => setLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </Box>
  );
}
