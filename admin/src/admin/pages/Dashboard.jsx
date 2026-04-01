import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, MenuItem, Select, FormControl, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api';
import SourceBadge from '../components/SourceBadge';
import { useToast } from '../components/Toast/ToastContext';
import { TableSkeleton, ServiceRowSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmModal } from '../components/ConfirmModal';

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
  'CANCELADA':  { bg: '#F1F3F4', text: '#5F6368', label: 'Cancelada' },
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
  const [bySource, setBySource] = useState({});
  const [updatingStatuses, setUpdatingStatuses] = useState({});

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedResId, setSelectedResId] = useState(null);

  // Feedback
  const toast = useToast();
  const [error, setError] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await apiClient(`/admin/dashboard?date=${TODAY}`);
      const list = (data.reservations || []).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      setTodayRes(list);
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

  const handleStatusUpdate = async (id, newStatus, reason = null) => {
    if (newStatus === 'CANCELADA' && !reason) {
      setSelectedResId(id);
      setCancelModalOpen(true);
      return;
    }

    setUpdatingStatuses(prev => ({ ...prev, [id]: true }));
    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: newStatus,
          cancellation_reason: reason 
        }),
      });
      setTodayRes(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setUpdatingStatuses(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCancelConfirm = () => {
    handleStatusUpdate(selectedResId, 'CANCELADA', cancelReason || 'Cancelada por el administrador');
    setCancelModalOpen(false);
    setCancelReason('');
    setSelectedResId(null);
  };


  // Derived stats
  const activeRes = todayRes.filter(r => r.status?.toUpperCase() !== 'CANCELADA');
  const guestsToday = activeRes.reduce((s, r) => s + (r.guests || 0), 0);
  const noShows = todayRes.filter(r => r.status?.toUpperCase() === 'NO_ASISTIÓ').length;
  const cancelledRes = todayRes.filter(r => r.status?.toUpperCase() === 'CANCELADA').length;
  const currentTime = now();
  const nextRes = activeRes.find(r => (r.time || '') >= currentTime && r.status?.toUpperCase() !== 'NO_ASISTIÓ');

  const alerts = [];
  const noPhone = activeRes.filter(r => !r.customer?.phone);
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

      {/* ROW 1 — STATS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: '16px' }}>
        <StatCard icon="event" label="Reservas de hoy" value={activeRes.length} color="#1A73E8" />
        <StatCard icon="group" label="Personas hoy" value={guestsToday} color="#137333" />
        <StatCard icon="schedule" label="Próxima reserva" value={nextRes ? nextRes.time : '—'} sub={nextRes?.customer?.name} color="#7D4A00" />
        <StatCard icon="person_off" label="No presentados" value={noShows} color="#C5221F" />
        <StatCard icon="cancel" label="Canceladas" value={cancelledRes} color="#5F6368" />
      </Box>

      {/* ROW 2 — MAIN CONTENT */}
      <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', lg: 'row' } }}>
        
        {/* LEFT — SERVICIO EN CURSO */}
        <Paper sx={{ flex: 1, minWidth: 0, border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', overflow: 'hidden' }}>
          <Box sx={{ px: '20px', py: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                Servicio en curso
              </Typography>
              {!loadingToday && todayRes.length > 0 && (
                <Box sx={{ 
                  width: 8, height: 8, borderRadius: '50%', bgcolor: '#1A73E8', 
                  boxShadow: '0 0 0 3px rgba(26,115,232,0.15)' 
                }} />
              )}
            </Box>
          </Box>

          {loadingToday ? (
            <Box>
              {[1, 2, 3, 4].map(i => <ServiceRowSkeleton key={i} />)}
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
                      position: 'relative',
                      '&:hover': { bgcolor: isCurrent ? '#FFF9C4' : '#F8F9FA' }
                    }}
                  >
                    {isCurrent && (
                      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#F29900' }} />
                    )}
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
                    {updatingStatuses[r.id] ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 100 }}>
                        <CircularProgress size={20} sx={{ color: chip.text }} />
                      </Box>
                    ) : (
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
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* RIGHT — CONTROL PANEL */}
        <Box sx={{ width: { xs: '100%', lg: 280 }, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          

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


      <ConfirmModal 
        open={cancelModalOpen}
        title="Cancelar reserva"
        body="¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer."
        confirmLabel="Cancelar Reserva"
        confirmColor="#D93025"
        confirmDisabled={selectedResId ? updatingStatuses[selectedResId] : false}
        showInput={true}
        inputValue={cancelReason}
        onInputChange={setCancelReason}
        inputPlaceholder="Motivo (opcional — se enviará al cliente)"
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason('');
          setSelectedResId(null);
        }}
        onConfirm={handleCancelConfirm}
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
