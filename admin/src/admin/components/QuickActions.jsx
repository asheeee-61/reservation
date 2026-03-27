import { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Dialog } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const TODAY = new Date().toISOString().split('T')[0];

export default function QuickActions() {
  const navigate = useNavigate();
  const [blockModal, setBlockModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const handleBlockDay = async () => {
    setBlocking(true);
    try {
      // Read current config, add today to blocked days
      const config = await apiClient('/admin/config').catch(() => ({}));
      const blocked = Array.isArray(config.blockedDays) ? config.blockedDays : [];
      if (!blocked.includes(TODAY)) {
        await apiClient('/admin/config', {
          method: 'POST',
          body: JSON.stringify({ ...config, blockedDays: [...blocked, TODAY] }),
        });
      }
    } catch (e) {
      console.error('Block day failed', e);
    } finally {
      setBlocking(false);
      setBlockModal(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

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
            textTransform: 'none', whiteSpace: 'nowrap', boxShadow: 'none',
            '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
          }}
        >
          Nueva reserva
        </Button>

        {/* Bloquear día — outlined */}
        <Button
          variant="outlined"
          disableElevation
          onClick={() => setBlockModal(true)}
          startIcon={<span className="material-icons" style={{ fontSize: 18 }}>block</span>}
          sx={{
            border: '1px solid #DADCE0', color: '#202124', bgcolor: '#FFFFFF',
            height: 36, px: '16px', borderRadius: '4px',
            fontFamily: 'Roboto', fontSize: 14, fontWeight: 500,
            textTransform: 'none', whiteSpace: 'nowrap', boxShadow: 'none',
            '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
          }}
        >
          Bloquear día
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
            textTransform: 'none', whiteSpace: 'nowrap', boxShadow: 'none',
            '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
          }}
        >
          Calendario
        </Button>
      </Box>

      {/* Bloquear día modal */}
      <ConfirmModal
        open={blockModal}
        title="Bloquear día"
        body={`¿Seguro que quieres cerrar este día completo? (${TODAY})`}
        confirmLabel={blocking ? 'Bloqueando...' : 'Bloquear día'}
        confirmDisabled={blocking}
        confirmColor="#D93025"
        onCancel={() => setBlockModal(false)}
        onConfirm={handleBlockDay}
      />
    </>
  );
}

// Reusable MD2 confirmation modal
export function ConfirmModal({ open, title, body, confirmLabel, confirmColor = '#D93025', confirmDisabled, onCancel, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          width: '100%', maxWidth: 400,
          bgcolor: '#FFFFFF', borderRadius: '4px',
          p: '24px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          m: '16px',
        },
      }}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.4)' } } }}
    >
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mt: '8px' }}>
        {body}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', mt: '24px' }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={confirmDisabled}
          sx={{
            height: 36, px: '24px', borderRadius: '4px',
            border: '1px solid #DADCE0', color: '#70757A',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled}
          disableElevation
          sx={{
            height: 36, px: '24px', borderRadius: '4px',
            bgcolor: confirmColor, color: '#FFFFFF',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': { bgcolor: confirmColor, filter: 'brightness(0.9)', boxShadow: 'none' },
          }}
        >
          {confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
