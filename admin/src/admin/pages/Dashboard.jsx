import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Button, MenuItem, Select, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api';
import { ConfirmModal } from '../components/ConfirmModal';
import SourceBadge from '../components/SourceBadge';
import { useToast } from '../components/Toast/ToastContext';
import { TableSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

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
  'ABIERTO':   { bg: '#E6F4EA', text: '#137333', label: 'Abierto',   icon: 'check_circle', btn: 'Cerrar día',   next: 'BLOQUEADO' },
  'CERRADO':   { bg: '#FEF7E0', text: '#7D4A00', label: 'Cerrado',   icon: 'pause_circle', btn: 'Reabrir día',  next: 'ABIERTO' },
  'BLOQUEADO': { bg: '#FDECEA', text: '#D93025', label: 'Bloqueado',  icon: 'block',        btn: 'Reabrir día',  next: 'ABIERTO' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Today's reservations
  const [todayRes, setTodayRes] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);

  // Day Status
  const [dayStatus, setDayStatus] = useState('ABIERTO');
  const [dayReason, setDayReason] = useState(null);
  const [bySource, setBySource] = useState({});
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', reason: '' });
  
  // Feedback
  const toast = useToast();
  const [error, setError] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await apiClient(`/admin/dashboard?date=${TODAY}`);
      const list = (data.reservations || []).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      setTodayRes(list);
      setDayStatus(data.dayStatus || 'ABIERTO');
      setDayReason(data.dayReason || null);
      setBySource(data.bySource || {});
    } catch (e) {
      if (e.name !== 'AbortError') setError(true);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTodayRes(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success('Estado actualizado');
    } catch (e) {
      toast.error('Error al actualizar');
    }
  };

  const updateDayStatus = async (status, reason = null) => {
    setTogglingStatus(true);
    try {
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: TODAY, status, reason }),
      });
      setDayStatus(status);
      toast.success(`Día ${status.toLowerCase()}`);
      fetchDashboardData();
    } catch (e) {
      toast.error('Error al actualizar el estado del día');
    } finally {
      setTogglingStatus(false);
      setConfirmModal({ open: false, type: '', reason: '' });
    }
  };

  const handleToggleClick = () => {
    if (dayStatus === 'ABIERTO') {
      setConfirmModal({ open: true, type: 'BLOQUEADO', reason: '' });
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

  if (error) {
    return (
      <ErrorState 
        message="Error al cargar el panel de control."
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {dayStatus === 'CERRADO' && (
        <Paper sx={{ p: '12px 20px', bgcolor: '#FEF7E0', border: '1px solid #FAD242', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-icons" style={{ color: '#7D4A00' }}>pause_circle</span>
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#7D4A00' }}>
              Día cerrado: No se permiten nuevas reservas desde la web.
            </Typography>
            {dayReason && (
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#7D4A00', fontStyle: 'italic', mt: '2px' }}>
                Motivo: {dayReason}
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* ROW 1 — STATS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '16px' }}>
        <StatCard icon="event" label="Reservas de hoy" value={todayRes.length} color="#1A73E8" />
        <StatCard icon="group" label="Personas hoy" value={guestsToday} color="#137333" />
        <StatCard icon="schedule" label="Próxima reserva" value={nextRes ? nextRes.time : '—'} sub={nextRes?.customer?.name} color="#7D4A00" />
        <StatCard icon="person_off" label="No presentados" value={noShows} color="#C5221F" />
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
            <Box p={3}>
              <TableSkeleton rows={4} cols={1} />
            </Box>
          ) : todayRes.length === 0 ? (
            <EmptyState icon="event_busy" title="Sin reservas" message="No hay reservas para hoy" />
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                          {r.customer?.name}
                        </Typography>
                        <SourceBadge source={r.source} />
                      </Box>
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

              {dayStatus === 'CERRADO' && dayReason && (
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#7D4A00', fontStyle: 'italic', bgcolor: '#FEF7E0', p: '8px', borderRadius: '4px', border: '1px dashed #FAD242' }}>
                  {dayReason}
                </Typography>
              )}

              <Button
                fullWidth
                variant="outlined"
                disabled={togglingStatus}
                onClick={handleToggleClick}
                sx={{
                  height: 36, textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500,
                  borderColor: '#DADCE0', color: '#202124',
                  '&:hover': { bgcolor: '#F1F3F4', borderColor: '#DADCE0' }
                }}
              >
                {DAY_STATUS_UI[dayStatus].btn}
              </Button>
            </Box>
          </Paper>

          {/* Origen de Reservas */}
          <Paper sx={{ p: '20px', border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1px', mb: 2 }}>
              Canales (hoy)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['web', 'manual', 'whatsapp'].map(src => {
                const count = bySource[src]?.count || 0;
                const pct = todayRes.length ? Math.round((count / todayRes.length) * 100) : 0;
                return (
                  <Box key={src} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <SourceBadge source={src} />
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', fontWeight: 500, color: '#202124' }}>
                      {count} <span style={{ color: '#70757A', fontSize: '11px', fontWeight: 400 }}>({pct}%)</span>
                    </Typography>
                  </Box>
                );
              })}
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
        body="¿Motivo del cierre? No se permitirán nuevas reservas web."
        showInput={confirmModal.type === 'BLOQUEADO'}
        inputValue={confirmModal.reason}
        onInputChange={(val) => setConfirmModal({ ...confirmModal, reason: val })}
        confirmLabel="CERRAR DÍA"
        onConfirm={() => updateDayStatus('BLOQUEADO', confirmModal.reason)}
        onCancel={() => setConfirmModal({ open: false, type: '', reason: '' })}
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
