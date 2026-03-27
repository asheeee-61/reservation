import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Button, CircularProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { ConfirmModal } from '../components/QuickActions';

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

export default function Dashboard() {
  const navigate = useNavigate();

  // Today's reservations
  const [todayRes, setTodayRes] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);

  // Config (for day state)
  const [config, setConfig] = useState(null);
  const [dayBlocked, setDayBlocked] = useState(false);
  const [togglingDay, setTogglingDay] = useState(false);

  // Block day modal
  const [blockModal, setBlockModal] = useState(false);
  const [unblockModal, setUnblockModal] = useState(false);

  const fetchToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await apiClient(`/admin/reservations?per_page=50&date=${TODAY}`);
      const list = (data.data ?? []).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      setTodayRes(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const cfg = await apiClient('/config');
      setConfig(cfg);
      const blockedDays = cfg?.blockedDays ?? [];
      setDayBlocked(blockedDays.includes(TODAY));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchToday();
    fetchConfig();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setTodayRes(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      fetchToday(); // revert on error
    }
  };

  const handleToggleDay = async (block) => {
    setTogglingDay(true);
    try {
      const cfg = config || {};
      const blocked = Array.isArray(cfg.blockedDays) ? cfg.blockedDays : [];
      const newBlocked = block
        ? [...new Set([...blocked, TODAY])]
        : blocked.filter(d => d !== TODAY);
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify({ ...cfg, blockedDays: newBlocked }),
      });
      setDayBlocked(block);
      setConfig(c => ({ ...c, blockedDays: newBlocked }));
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingDay(false);
      setBlockModal(false);
      setUnblockModal(false);
    }
  };

  // Derived stats
  const totalToday = todayRes.length;
  const noShows = todayRes.filter(r => r.status?.toUpperCase() === 'NO_ASISTIÓ').length;
  const guestsToday = todayRes.reduce((s, r) => s + (r.guests || 0), 0);
  const capacity = config?.totalCapacity || 40;
  const occupancyPct = capacity > 0 ? Math.round((guestsToday / capacity) * 100) : 0;

  const currentTime = now();
  const nextRes = todayRes.find(r => (r.time || '') >= currentTime && r.status?.toUpperCase() !== 'NO_ASISTIÓ');

  // Alerts
  const alerts = [];
  const noPhone = todayRes.filter(r => !r.customer?.phone);
  if (noPhone.length > 0) alerts.push({ icon: 'phone_disabled', text: `${noPhone.length} cliente${noPhone.length > 1 ? 's' : ''} sin teléfono`, path: '/admin/customers' });
  if (occupancyPct >= 90) alerts.push({ icon: 'warning', text: `Alta ocupación (${occupancyPct}%)`, path: '/admin/reservations' });
  const pending = todayRes.filter(r => r.status?.toUpperCase() === 'PENDIENTE');
  if (pending.length > 0) alerts.push({ icon: 'pending', text: `${pending.length} reserva${pending.length > 1 ? 's' : ''} pendiente${pending.length > 1 ? 's' : ''} de confirmar`, path: '/admin/reservations' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ROW 1 — STAT CARDS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '16px' }}>
        <StatCard icon="event" label="Reservas hoy" value={totalToday} loading={loadingToday} color="#1A73E8" />
        <StatCard icon="group" label="Comensales hoy" value={guestsToday} loading={loadingToday} color="#137333" />
        <StatCard
          icon="schedule"
          label="Próxima reserva"
          value={nextRes ? `${nextRes.time}` : '—'}
          sub={nextRes?.customer?.name}
          loading={loadingToday}
          color="#7D4A00"
        />
        <StatCard icon="person_off" label="No shows" value={noShows} loading={loadingToday} color="#C5221F" />
      </Box>

      {/* ROW 2 — SERVICIO EN CURSO + CONTROL RAPIDO */}
      <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'flex-start' }}>

        {/* LEFT — SERVICIO EN CURSO */}
        <Paper sx={{ flex: 1, minWidth: 0, border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', overflow: 'hidden' }}>
          <Box sx={{ px: '20px', py: '14px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Servicio en curso
            </Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A' }}>
              {TODAY}
            </Typography>
          </Box>

          {loadingToday ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: '32px' }}>
              <CircularProgress size={24} />
            </Box>
          ) : todayRes.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: '40px', gap: '8px' }}>
              <span className="material-icons" style={{ fontSize: 40, color: '#BDBDBD' }}>event_busy</span>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: 14, color: '#70757A' }}>Sin reservas para hoy</Typography>
            </Box>
          ) : (
            <Box>
              {todayRes.map((r, idx) => {
                const statusKey = r.status?.toUpperCase() || 'PENDIENTE';
                const chip = STATUS_CHIP[statusKey] || { bg: '#F1F3F4', text: '#202124', label: statusKey };
                const isPast = (r.time || '') < currentTime;
                const isCurrent = nextRes?.id === r.id;
                const isClosed = statusKey === 'ASISTIÓ' || statusKey === 'NO_ASISTIÓ';

                return (
                  <Box
                    key={r.id}
                    onClick={() => navigate(`/admin/reservations/view/${r.id}`)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      px: '20px', py: '10px', cursor: 'pointer',
                      borderBottom: idx < todayRes.length - 1 ? '1px solid #F1F3F4' : 'none',
                      bgcolor: isCurrent ? '#FFFDE7' : 'transparent',
                      opacity: isPast && !isCurrent ? 0.55 : 1,
                      '&:hover': { bgcolor: isCurrent ? '#FFF9C4' : '#F8F9FA' },
                    }}
                  >
                    {/* Time */}
                    <Typography sx={{
                      fontFamily: 'Roboto', fontWeight: isCurrent ? 600 : 500,
                      fontSize: '14px', color: isCurrent ? '#7D4A00' : '#202124',
                      minWidth: 44, flexShrink: 0,
                    }}>
                      {r.time || '—'}
                    </Typography>

                    {/* Name + pax */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                        {r.customer?.name || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>
                        {r.guests} pax
                      </Typography>
                    </Box>

                    {/* Status chip */}
                    <Box sx={{ bgcolor: chip.bg, color: chip.text, borderRadius: '4px', px: '8px', py: '3px', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {chip.label}
                      </Typography>
                    </Box>

                    {/* Inline action buttons */}
                    {!isClosed && (
                      <Box sx={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <ActionBtn
                          label="Asistió"
                          color="#137333"
                          bg="#E6F4EA"
                          icon="check_circle"
                          onClick={() => handleStatusUpdate(r.id, 'ASISTIÓ')}
                        />
                        <ActionBtn
                          label="No show"
                          color="#C5221F"
                          bg="#FDECEA"
                          icon="cancel"
                          onClick={() => handleStatusUpdate(r.id, 'NO_ASISTIÓ')}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* RIGHT — CONTROL RAPIDO */}
        <Box sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Estado del día */}
          <Paper sx={{ border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', p: '16px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '12px' }}>
              Estado del día
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                bgcolor: dayBlocked ? '#FDECEA' : '#E6F4EA',
                color: dayBlocked ? '#C5221F' : '#137333',
                borderRadius: '4px', px: '10px', py: '6px',
              }}>
                <span className="material-icons" style={{ fontSize: 16 }}>
                  {dayBlocked ? 'block' : 'check_circle'}
                </span>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px' }}>
                  {dayBlocked ? 'Cerrado' : 'Abierto'}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                disabled={togglingDay}
                onClick={() => dayBlocked ? setUnblockModal(true) : setBlockModal(true)}
                sx={{
                  height: 32, borderRadius: '4px', border: '1px solid #DADCE0',
                  color: '#202124', fontFamily: 'Roboto', fontSize: '12px',
                  fontWeight: 500, textTransform: 'none',
                  '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
                }}
              >
                {dayBlocked ? 'Abrir' : 'Cerrar'}
              </Button>
            </Box>
          </Paper>

          {/* Acciones rápidas */}
          <Paper sx={{ border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', p: '16px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '12px' }}>
              Acciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                fullWidth variant="contained" disableElevation
                onClick={() => navigate('/admin/reservations/new')}
                startIcon={<span className="material-icons" style={{ fontSize: 18 }}>add</span>}
                sx={{ height: 36, borderRadius: '4px', bgcolor: '#1A73E8', color: '#FFFFFF', fontFamily: 'Roboto', fontSize: 13, fontWeight: 500, textTransform: 'none', boxShadow: 'none', justifyContent: 'flex-start', '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' } }}
              >
                Nueva reserva
              </Button>
              <Button
                fullWidth variant="outlined" disableElevation
                onClick={() => navigate('/admin/reservations')}
                startIcon={<span className="material-icons" style={{ fontSize: 18 }}>list</span>}
                sx={{ height: 36, borderRadius: '4px', border: '1px solid #DADCE0', color: '#202124', bgcolor: '#FFFFFF', fontFamily: 'Roboto', fontSize: 13, fontWeight: 500, textTransform: 'none', boxShadow: 'none', justifyContent: 'flex-start', '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' } }}
              >
                Ver todas las reservas
              </Button>
            </Box>
          </Paper>

          {/* Alertas */}
          {alerts.length > 0 && (
            <Paper sx={{ border: '1px solid #FEF3CD', bgcolor: '#FFFDE7', boxShadow: 'none', borderRadius: '4px', p: '16px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#7D4A00', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '10px' }}>
                Alertas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {alerts.map((a, i) => (
                  <Box
                    key={i}
                    onClick={() => navigate(a.path)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', '&:hover': { opacity: 0.75 },
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16, color: '#7D4A00', flexShrink: 0 }}>{a.icon}</span>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#7D4A00', fontWeight: 400 }}>
                      {a.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Modals */}
      <ConfirmModal
        open={blockModal}
        title="Cerrar día"
        body={`¿Seguro que quieres bloquear ${TODAY} completo? No se aceptarán nuevas reservas.`}
        confirmLabel="Bloquear día"
        confirmColor="#D93025"
        onCancel={() => setBlockModal(false)}
        onConfirm={() => handleToggleDay(true)}
      />
      <ConfirmModal
        open={unblockModal}
        title="Abrir día"
        body={`¿Quieres volver a abrir ${TODAY} para reservas?`}
        confirmLabel="Abrir día"
        confirmColor="#1A73E8"
        onCancel={() => setUnblockModal(false)}
        onConfirm={() => handleToggleDay(false)}
      />
    </Box>
  );
}

// Stat card helper
function StatCard({ icon, label, value, sub, loading, color }) {
  return (
    <Paper sx={{ border: '1px solid #E0E0E0', boxShadow: 'none', borderRadius: '4px', p: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
        <span className="material-icons" style={{ fontSize: 18, color }}>{icon}</span>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          {label}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 600, fontSize: '28px', color, lineHeight: 1 }}>
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mt: '4px' }}>
              {sub}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}

// Inline action button
function ActionBtn({ label, color, bg, icon, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        bgcolor: bg, color, borderRadius: '4px',
        px: '8px', py: '4px', cursor: 'pointer',
        '&:hover': { filter: 'brightness(0.93)' },
      }}
    >
      <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  );
}
