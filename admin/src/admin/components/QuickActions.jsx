import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { label: 'Nueva reserva',  icon: 'add',              path: '/admin/reservations/new' },
  { label: 'Bloquear día',   icon: 'block',             path: '/admin/settings' },
  { label: 'Ir a calendario',icon: 'calendar_month',    path: '/admin/calendar' },
  { label: 'Ver clientes',   icon: 'people',            path: '/admin/customers' },
];

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAction = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Box ref={containerRef} sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      {/* + Nueva button */}
      <Button
        variant="contained"
        disableElevation
        onClick={() => navigate('/admin/reservations/new')}
        startIcon={<span className="material-icons" style={{ fontSize: 18 }}>add</span>}
        sx={{
          bgcolor: '#1A73E8',
          color: '#FFFFFF',
          height: 36,
          px: '16px',
          borderRadius: '4px',
          fontFamily: 'Roboto',
          fontSize: 14,
          fontWeight: 500,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
        }}
      >
        Nueva
      </Button>

      {/* ⚡ Acciones button + dropdown */}
      <Box sx={{ position: 'relative' }}>
        <Button
          variant="outlined"
          disableElevation
          onClick={() => setOpen((prev) => !prev)}
          startIcon={<span style={{ fontSize: 16 }}>⚡</span>}
          endIcon={
            <span className="material-icons" style={{ fontSize: 16 }}>
              {open ? 'expand_less' : 'expand_more'}
            </span>
          }
          sx={{
            border: '1px solid #DADCE0',
            color: '#202124',
            height: 36,
            px: '12px',
            borderRadius: '4px',
            fontFamily: 'Roboto',
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            bgcolor: '#FFFFFF',
            '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
          }}
        >
          Acciones
        </Button>

        {open && (
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              width: 200,
              bgcolor: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              zIndex: 1300,
              py: '4px',
            }}
          >
            {ACTIONS.map((action) => (
              <Box
                key={action.label}
                onClick={() => handleAction(action.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 40,
                  px: '12px',
                  gap: '12px',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F1F3F4' },
                }}
              >
                <span
                  className="material-icons"
                  style={{ fontSize: 18, color: '#70757A', flexShrink: 0 }}
                >
                  {action.icon}
                </span>
                <Typography
                  sx={{
                    fontFamily: 'Roboto',
                    fontSize: 14,
                    fontWeight: 400,
                    color: '#202124',
                  }}
                >
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
