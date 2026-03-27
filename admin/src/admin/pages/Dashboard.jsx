import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Button, CircularProgress, MenuItem, Select, FormControl, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { ConfirmModal } from '../components/ConfirmModal'; // I will move ConfirmModal to its own file or use from QuickActions if exported

const TODAY = new Date().toISOString().split('T')[0];

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const STATUS_CHIP = {
  'PENDIENTE':  { bg: '#FEF7E0', text: '#7D4A00', label: 'Pendiente' },
  'CONFIRMADA': { bg: '#E8F0FE', text: '#1A73E8', label: 'Confirmada' },
  'ASISTIÓ':    { bg: '#E6F4EA', text: '#137333', label: 'Asistió' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F', label: 'No asistió' },
};

const DAY_STATUS_UI = {
  'ABIERTO':   { bg: '#E6F4EA', text: '#137333', label: 'Abierto',   icon: 'check_circle', btn: 'Cerrar día',   next: 'CERRADO' },
  'CERRADO':   { bg: '#FEF7E0', text: '#7D4A00', label: 'Cerrado',   icon: 'pause_circle', btn: 'Reabrir día',  next: 'ABIERTO' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Today's reservations
  const [todayRes, setTodayRes] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);

  // Day Status
  const [dayStatus, setDayStatus] = useState('ABIERTO');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '' });
  
  // Feedback
  const [toast, setToast] = useState({ open: false, message: '' });

  const fetchToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await apiClient(`/admin/reservations?per_page=100&date=${TODAY}`);
      const list = (data.data ?? []).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      setTodayRes(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchDayStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await apiClient(`/day-status?date=${TODAY}`);
      setDayStatus(data.status || 'ABIERTO');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
    fetchDayStatus();
  }, [fetchToday, fetchDayStatus]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTodayRes(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      setToast({ open: true, message: 'Estado actualizado' });
    } catch (e) {
      console.error(e);
    }
  };

  const updateDayStatus = async (status) => {
    setTogglingStatus(true);
    try {
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: TODAY, status }),
      });
      setDayStatus(status);
      setToast({ open: true, message: `Día ${status.toLowerCase()}` });
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingStatus(false);
      setConfirmModal({ open: false, type: '' });
    }
  };

  const handleToggleClick = () => {
    if (dayStatus === 'ABIERTO') {
      setConfirmModal({ open: true, type: 'CERRADO' });
    } else {
      updateDayStatus('ABIERTO');
    }
  };

  // Derived stats
  const guestsToday = todayRes.reduce((s, r) => s + (r.guests || 0), 0);
  const noShows = todayRes.filter(r => r.status?.toUpperCase() === 'NO_ASISTIÓ').length;
  const currentTime = now();
  const nextRes = todayRes.find(r => (r.time || '') >= currentTime && r.status?.toUpperCase() !== 'NO_ASISTIÓ');

  const alerts = [];
  const noPhone = todayRes.filter(r => !r.customer?.phone);
  if (noPhone.length > 0) alerts.push({ icon: 'phone_disabled', text: `${noPhone.length} clientes sin teléfono`, path: '/admin/customers' });
  if (guestsToday > 30) alerts.push({ icon: 'warning', text: `Alta ocupación hoy`, path: '/admin/reservations' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {dayStatus === 'CERRADO' && (
        <Paper sx={{ p: '12px 20px', bgcolor: '#FEF7E0', border: '1px solid #FAD242', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-icons" style={{ color: '#7D4A00' }}>pause_circle</span>
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#7D4A00' }}>
            Día cerrado: No se permiten nuevas reservas desde la web.
          </Typography>
        </Paper>
      )}

      {/* ROW 1 — STATS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '16px' }}>
        <StatCard icon="event" label="Hoy" value={todayRes.length} color="#1A73E8" />
        <StatCard icon="group" label="Pax hoy" value={guestsToday} color="#137333" />
        <StatCard icon="schedule" label="Próxima" value={nextRes ? nextRes.time : '—'} sub={nextRes?.customer?.name} color="#7D4A00" />
        <StatCard icon="person_off" label="No shows" value={noShows} color="#C5221F" />
      </Box>

      {/* ROW 2 — MAIN CONTENT */}
      <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', lg: 'row' } }}>
        
        {/* LEFT — SERVICIO EN CURSO */}
        <Paper sx={{ flex: 1, minWidth: 0, border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', overflow: 'hidden' }}>
          <Box sx={{ px: '20px', py: '16px', borderBottom: '1px solid #E0E0E0' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Servicio en curso
            </Typography>
          </Box>

          {loadingToday ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : todayRes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Sin reservas para hoy</Typography></Box>
          ) : (
            <Box>
              {todayRes.map((r, idx) => {
                const sKey = r.status?.toUpperCase() || 'PENDIENTE';
                const chip = STATUS_CHIP[sKey] || { bg: '#F1F3F4', text: '#202124', label: sKey };
                const isCurrent = nextRes?.id === r.id;
                const isPast = r.time < currentTime && !isCurrent;

                return (
                  <Box key={r.id} 
                    onClick={() => navigate(`/admin/reservations/view/${r.id}`)}
                    sx={{
                      display: 'flex', alignItems: 'center', px: '20px', py: '12px',
                      borderBottom: idx < todayRes.length - 1 ? '1px solid #F1F3F4' : 'none',
                      bgcolor: isCurrent ? '#FEF7E0' : 'transparent',
                      opacity: isPast ? 0.6 : 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: isCurrent ? '#FFF9C4' : '#F8F9FA' }
                    }}
                  >
                    <Typography sx={{ width: 50, fontFamily: 'Roboto', fontWeight: 600, fontSize: '14px', color: '#202124' }}>
                      {r.time}
                    </Typography>
                    <Box sx={{ flex: 1, ml: 2 }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                        {r.customer?.name}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>
                        {r.guests} personas
                      </Typography>
                    </Box>
                    
                    {/* Interactive Status Selector */}
                    <FormControl size="small" variant="standard" sx={{ m: 0 }} onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={sKey}
                        onChange={(e) => handleStatusUpdate(r.id, e.target.value)}
                        disableUnderline
                        sx={{
                          bgcolor: chip.bg, color: chip.text, borderRadius: '4px', px: '8px',
                          fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px',
                          '& .MuiSelect-select': { py: '4px', pr: '24px !important', textTransform: 'uppercase' },
                          '& .MuiSvgIcon-root': { color: chip.text, right: 0 }
                        }}
                      >
                        {Object.keys(STATUS_CHIP).map(k => (
                          <MenuItem key={k} value={k} sx={{ fontFamily: 'Roboto', fontSize: '13px', textTransform: 'uppercase' }}>
                            {STATUS_CHIP[k].label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* RIGHT — CONTROL PANEL */}
        <Box sx={{ width: { xs: '100%', lg: 280 }, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Day Status Card */}
          <Paper sx={{ p: '20px', border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1px', mb: 2 }}>
              Estado del día
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: '8px', p: '8px 12px', borderRadius: '4px',
                bgcolor: DAY_STATUS_UI[dayStatus].bg, color: DAY_STATUS_UI[dayStatus].text
              }}>
                <span className="material-icons" style={{ fontSize: 20 }}>{DAY_STATUS_UI[dayStatus].icon}</span>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 600, fontSize: '14px' }}>
                  {DAY_STATUS_UI[dayStatus].label}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                disabled={togglingStatus}
                onClick={handleToggleClick}
                sx={{
                  height: 36, textTransform: 'none', fontFamily: 'Roboto', fontWeight: 500,
                  borderColor: '#DADCE0', color: '#202124',
                  '&:hover': { bgcolor: '#F1F3F4', borderColor: '#DADCE0' }
                }}
              >
                {DAY_STATUS_UI[dayStatus].btn}
              </Button>
            </Box>
          </Paper>

          {/* Alertas */}
          {alerts.length > 0 && (
            <Paper sx={{ p: '20px', border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', bgcolor: '#FFFDE7' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#7D4A00', textTransform: 'uppercase', letterSpacing: '1px', mb: 2 }}>
                Alertas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(a.path)}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#7D4A00' }}>{a.icon}</span>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#7D4A00' }}>{a.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

        </Box>
      </Box>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Cerrar día"
        body="¿Seguro que quieres cerrar este día? No se permitirán nuevas reservas web."
        confirmLabel="Cerrar día"
        onConfirm={() => updateDayStatus('CERRADO')}
        onCancel={() => setConfirmModal({ open: false, type: '' })}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
      />
    </Box>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <Paper sx={{ p: '16px', border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: 1 }}>
        <span className="material-icons" style={{ fontSize: 18, color }}>{icon}</span>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase' }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 600, fontSize: '24px', color }}>{value}</Typography>
      {sub && <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{sub}</Typography>}
    </Paper>
  );
}
