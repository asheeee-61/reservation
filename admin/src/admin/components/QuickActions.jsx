import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { ConfirmModal } from './ConfirmModal';

const TODAY = new Date().toISOString().split('T')[0];

export default function QuickActions() {
  const navigate = useNavigate();
  const [blockModal, setBlockModal] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const handleBlockDay = async () => {
    setBlocking(true);
    try {
      // For legacy compatibility, we keep updating config.json 
      // but the main source of truth is now the day_statuses table handled in Dashboard
      const config = await apiClient('/admin/config').catch(() => ({}));
      const blocked = Array.isArray(config.blockedDays) ? config.blockedDays : [];
      if (!blocked.includes(TODAY)) {
        await apiClient('/admin/config', {
          method: 'POST',
          body: JSON.stringify({ ...config, blockedDays: [...blocked, TODAY] }),
        });
      }
      
      // Also update the new day_status table for consistency
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: TODAY, status: 'BLOQUEADO' }),
      });
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
