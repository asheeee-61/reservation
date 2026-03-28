import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

      {/* Nueva reserva — primary */}
      <Button
        variant="contained"
        disableElevation
        onClick={() => navigate('/admin/reservations/new')}
        startIcon={<span className="material-icons" style={{ fontSize: 18 }}>add</span>}
        sx={{
          bgcolor: '#1A73E8', color: '#FFFFFF',
          height: 36, px: '16px', borderRadius: '4px',
          fontFamily: 'Roboto', fontSize: 14, fontWeight: 500,
          textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: 'none',
          '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
        }}
      >
        Nueva reserva
      </Button>

      {/* Ir a calendario — outlined */}
      <Button
        variant="outlined"
        disableElevation
        onClick={() => navigate('/admin/calendar')}
        startIcon={<span className="material-icons" style={{ fontSize: 18 }}>calendar_month</span>}
        sx={{
          border: '1px solid #DADCE0', color: '#202124', bgcolor: '#FFFFFF',
          height: 36, px: '16px', borderRadius: '4px',
          fontFamily: 'Roboto', fontSize: 14, fontWeight: 500,
          textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: 'none',
          '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
        }}
      >
        Calendario
      </Button>
    </Box>
  );
}
