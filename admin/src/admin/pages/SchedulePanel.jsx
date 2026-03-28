import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Button, IconButton, 
  CircularProgress, Snackbar, Tabs, Tab, Accordion, 
  AccordionSummary, AccordionDetails, Select, MenuItem, FormControl
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import { useSettingsStore } from '../store/useSettingsStore';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const INTERVAL_OPTIONS = [15, 30, 45, 60, 90, 120];
const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`);
    opts.push(`${String(h).padStart(2, '0')}:30`);
  }
  return opts;
})();

export default function SchedulePanel() {
  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeString = (minutes) => {
    const normalized = minutes % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const globalHours = useSettingsStore(state => state.globalHours);
  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Cambios guardados");
  const [regenMsg, setRegenMsg] = useState(null);
  
  const [blockMonthStart, setBlockMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedMeta, setBlockedMeta] = useState(null);
  const [blockingDate, setBlockingDate] = useState(null);
  const [blockingReason, setBlockingReason] = useState('');
  const [selectedDayStatus, setSelectedDayStatus] = useState({ status: 'ABIERTO', reason: null });
  const BLOCKED_PER_PAGE = 5;

  useEffect(() => {
    fetchGlobalHours();
    fetchConfig();
  }, [fetchGlobalHours]);

  const fetchBlockedDates = async (page = 1) => {
    try {
      const data = await apiClient(`/admin/blocked-dates?page=${page}&per_page=${BLOCKED_PER_PAGE}`);
      setBlockedDates(data.data ?? []);
      setBlockedMeta(data.meta ?? null);
    } catch (e) {
      console.error('Failed to fetch blocked dates', e);
    }
  };

  useEffect(() => {
    fetchBlockedDates(blockedPage);
  }, [blockedPage]);

  useEffect(() => {
    const fetchSpecificDayStatus = async () => {
      const s = selectedDate.toISOString().split('T')[0];
      try {
        const data = await apiClient(`/admin/day-status?date=${s}`);
        setSelectedDayStatus({ 
          status: data.status || 'ABIERTO', 
          reason: data.reason || null 
        });
      } catch (e) {
        setSelectedDayStatus({ status: 'ABIERTO', reason: null });
      }
    };
    fetchSpecificDayStatus();
  }, [selectedDate]);

  const fetchConfig = async () => {
    try {
      const data = await apiClient('/config');
      const schedule = data.schedule || {};
      DAYS.forEach(day => {
        if (!schedule[day]) schedule[day] = { open: true, shifts: [] };
        if (!schedule[day].shifts || schedule[day].shifts.length === 0) {
           const oldOp = schedule[day].openingTime || '09:00';
           const oldCl = schedule[day].closingTime || '23:30';
           const defaultInterval = useSettingsStore.getState().globalHours?.defaultInterval || 30;
           const oldInt = schedule[day].interval || defaultInterval;
           let oldSlots = schedule[day].slots || {};
           
           if (Object.keys(oldSlots).length === 0) {
              const defaultSlots = ["13:00", "13:30", "14:00", "14:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];
              defaultSlots.forEach(time => oldSlots[time] = true);
           }
           
           schedule[day].shifts = [{ id: 1, openingTime: oldOp, closingTime: oldCl, interval: oldInt, slots: oldSlots }];
           delete schedule[day].slots;
           delete schedule[day].openingTime;
           delete schedule[day].closingTime;
           delete schedule[day].interval;
        }
      });
      setConfig({ ...data, schedule, blockedDays: data.blockedDays || [] });
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const saveConfigState = async (newConfig, showToast = false) => {
    setConfig(newConfig);
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify(newConfig)
      });
      if (showToast) {
        setToastMessage("Cambios guardados");
        setToastOpen(true);
      }
      // Re-fetch blocked dates from backend to keep list in sync
      fetchBlockedDates(blockedPage);
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const manualSave = async (msg = "Cambios guardados") => {
    for (const day of DAYS) {
      const shifts = config.schedule[day].shifts;
      for (const shift of shifts) {
        const oMins = toMinutes(shift.openingTime);
        let cMins = toMinutes(shift.closingTime);
        if (cMins <= oMins) cMins += 1440;
        if (cMins - oMins < 30) {
          setToastMessage(`El turno en ${DAY_LABELS[day]} debe durar al menos 30 minutos.`);
          setToastOpen(true);
          return;
        }
      }
      if (shifts.length === 2) {
        let s1Open  = toMinutes(shifts[0].openingTime);
        let s1Close = toMinutes(shifts[0].closingTime);
        let s2Open  = toMinutes(shifts[1].openingTime);
        let s2Close = toMinutes(shifts[1].closingTime);

        if (s1Close <= s1Open) s1Close += 1440;
        if (s2Close <= s2Open) s2Close += 1440;
        if (s2Open < s1Open) { s2Open += 1440; s2Close += 1440; }

        if (s2Open < s1Close) {
          setToastMessage(`Hay turnos solapados en ${DAY_LABELS[day]}. Corrígelos antes de guardar.`);
          setToastOpen(true);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      setToastMessage(msg);
      setToastOpen(true);
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <Box p={4}><CircularProgress /></Box>;

  const handleDateChange = (daysToAdd) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + daysToAdd);
    setSelectedDate(nextDate);
  };

  const jsDayIndex = selectedDate.getDay();
  const dayNameMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayKey = dayNameMapping[jsDayIndex];
  const currentDaySchedule = config.schedule[currentDayKey];

  const dateFormatted = `${DAY_LABELS[currentDayKey]}, ${selectedDate.getDate()} de ${MONTH_NAMES[selectedDate.getMonth()].toLowerCase()}`;

  const toggleDayStatusInstant = () => {
    const newConfig = {
      ...config,
      schedule: {
        ...config.schedule,
        [currentDayKey]: { ...currentDaySchedule, open: !currentDaySchedule.open }
      }
    };
    saveConfigState(newConfig, true);
  };

  const toggleSlotInstant = (time, shiftId) => {
    const newShifts = currentDaySchedule.shifts.map(s => {
      if (s.id === shiftId) return { ...s, slots: { ...s.slots, [time]: !s.slots[time] } };
      return s;
    });
    const newConfig = { ...config, schedule: { ...config.schedule, [currentDayKey]: { ...currentDaySchedule, shifts: newShifts } } };
    saveConfigState(newConfig, true);
  };

  const toggleAllInstant = (status) => {
    const newShifts = currentDaySchedule.shifts.map(s => {
      const newSlots = { ...s.slots };
      Object.keys(newSlots).forEach(time => newSlots[time] = status);
      return { ...s, slots: newSlots };
    });
    const newConfig = { ...config, schedule: { ...config.schedule, [currentDayKey]: { ...currentDaySchedule, shifts: newShifts } } };
    saveConfigState(newConfig, true);
  };

  const updateShiftConfig = (day, shiftId, field, value) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const newShifts = dayConf.shifts.map(s => s.id === shiftId ? { ...s, [field]: value } : s);
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } };
    });
  };

  const addShift = (day) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const nextId = Math.max(0, ...dayConf.shifts.map(s => s.id)) + 1;
      const newShifts = [...dayConf.shifts, { id: nextId, openingTime: '20:00', closingTime: globalHours.closingTime === '00:00' ? '23:30' : globalHours.closingTime, interval: globalHours.defaultInterval || 30, slots: {} }];
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } };
    });
  };

  const removeShift = (day, shiftId) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const newShifts = dayConf.shifts.filter(s => s.id !== shiftId);
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } };
    });
  };

  const handleRegenerateSlots = (day, shiftId) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const shift = dayConf.shifts.find(s => s.id === shiftId);
      
      const openMin = toMinutes(shift.openingTime);
      let closeMin = toMinutes(shift.closingTime);
      if (closeMin <= openMin) closeMin += 1440;
      
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        newSlots[toTimeString(t)] = true;
      }
      
      setRegenMsg({ day, shiftId, msg: `✓ ${Object.keys(newSlots).length} franjas generadas (${shift.interval} min)` });
      setTimeout(() => setRegenMsg(null), 3000);
      
      const newShifts = dayConf.shifts.map(s => s.id === shiftId ? { ...s, slots: newSlots } : s);
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } };
    });
  };

  const copyMondayToAll = () => {
    const monShifts = config.schedule.monday.shifts;
    const generateSlots = (shift) => {
      const openMin = toMinutes(shift.openingTime);
      let closeMin = toMinutes(shift.closingTime);
      if (closeMin <= openMin) closeMin += 1440;
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        newSlots[toTimeString(t)] = true;
      }
      return { ...shift, slots: newSlots };
    };

    const newMonShifts = monShifts.map(generateSlots);
    const newSchedule = { ...config.schedule };
    DAYS.forEach(day => {
      newSchedule[day] = { ...newSchedule[day], shifts: JSON.parse(JSON.stringify(newMonShifts)) };
    });
    
    setConfig({ ...config, schedule: newSchedule });
    setToastMessage("Turnos de Lunes copiados a todos los días");
    setToastOpen(true);
  };

  const toggleDayStatusWeekly = (day) => {
    setConfig(prev => ({
      ...prev, schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], open: !prev.schedule[day].open } }
    }));
  };

  const toggleSlotWeekly = (day, shiftId, time) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const newShifts = dayConf.shifts.map(s => s.id === shiftId ? { ...s, slots: { ...s.slots, [time]: !s.slots[time] } } : s);
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } };
    });
  };

  const toggleAllWeekly = (day, shiftId, status) => {
    setConfig(prev => {
       const dayConf = prev.schedule[day];
       const newShifts = dayConf.shifts.map(s => {
         if (s.id !== shiftId) return s;
         const newSlots = { ...s.slots };
         Object.keys(newSlots).forEach(t => newSlots[t] = status);
         return { ...s, slots: newSlots };
       });
       return { ...prev, schedule: { ...prev.schedule, [day]: { ...dayConf, shifts: newShifts } } }
    });
  };

  const changeBlockMonth = (months) => {
    const nextMonth = new Date(blockMonthStart);
    nextMonth.setMonth(blockMonthStart.getMonth() + months);
    setBlockMonthStart(nextMonth);
  };

  const isBlocked = (dateStr) => blockedDates.some(bd => bd.date === dateStr);

  const toggleBlockDate = (dateOb) => {
    const yyyy = dateOb.getFullYear();
    const mm = String(dateOb.getMonth() + 1).padStart(2, '0');
    const dd = String(dateOb.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const existing = blockedDates.find(bd => bd.date === dateStr);
    if (existing) {
      // If already blocked, unblock immediately
      unblockDate(dateStr);
    } else {
      // If not blocked, show the mini form
      setBlockingDate(dateOb);
      setBlockingReason('');
    }
  };

  const unblockDate = async (dateStr) => {
    try {
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: dateStr, status: 'ABIERTO' })
      });
      fetchBlockedDates(blockedPage);
      setToastMessage("Día desbloqueado");
      setToastOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmBlock = async () => {
    if (!blockingDate) return;
    const yyyy = blockingDate.getFullYear();
    const mm = String(blockingDate.getMonth() + 1).padStart(2, '0');
    const dd = String(blockingDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    try {
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: dateStr, status: 'CERRADO', reason: blockingReason })
      });
      fetchBlockedDates(blockedPage);
      setBlockingDate(null);
      setToastMessage("Día bloqueado correctamente");
      setToastOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const renderMonthGrid = () => {
    const startOfMonth = new Date(blockMonthStart.getFullYear(), blockMonthStart.getMonth(), 1);
    const endOfMonth = new Date(blockMonthStart.getFullYear(), blockMonthStart.getMonth() + 1, 0);
    
    let currentDayStr = startOfMonth.getDay(); 
    let leadingEmptyDays = currentDayStr === 0 ? 6 : currentDayStr - 1;

    const daysInMonth = endOfMonth.getDate();
    const cells = [];

    const dayHeaders = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    dayHeaders.forEach(dh => {
      cells.push(
        <Box key={dh} sx={{ width: '14.28%', textAlign: 'center', py: 1 }}>
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontWeight: 500 }}>{dh}</Typography>
        </Box>
      );
    });

    for (let i = 0; i < leadingEmptyDays; i++) {
        cells.push(<Box key={`empty-${i}`} sx={{ width: '14.28%', height: 40 }} />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(blockMonthStart.getFullYear(), blockMonthStart.getMonth(), i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const blocked = isBlocked(dateStr);
      const isToday = dateStr === todayStr;

      let bg = 'transparent';
      let color = '#202124';
      if (blocked) { bg = '#FDECEA'; color = '#D93025'; } 
      else if (isToday) { bg = '#E8F0FE'; color = '#1A73E8'; }

      cells.push(
        <Box key={i} sx={{ width: '14.28%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0.5 }}>
          <Box 
            onClick={() => toggleBlockDate(d)}
            sx={{ 
              width: 32, height: 32, borderRadius: '50%', bgcolor: bg, color: color,
              display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
              '&:hover': { bgcolor: blocked ? '#F8D8D5' : '#F1F3F4' }
            }}
          >
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: (isToday || blocked) ? 500 : 400 }}>{i}</Typography>
          </Box>
        </Box>
      );
    }
    return <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>{cells}</Box>;
  };


  return (
    <Box sx={{ pb: 8, width: '100%' }}>
      <Typography sx={{ 
        fontFamily: 'Roboto', fontWeight: 500, color: '#202124', mb: '24px',
        [DESKTOP]: { fontSize: '20px' },
        [TABLET]: { fontSize: '18px' },
        [MOBILE]: { fontSize: '16px' }
      }}>
        CONFIGURACIÓN DEL CALENDARIO
      </Typography>

      <Paper sx={{ width: '100%', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', p: 0, overflow: 'hidden' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: '#1A73E8', height: 2 } }}
          sx={{ borderBottom: '1px solid #E0E0E0', minHeight: 48, height: 48 }}
        >
          <Tab label="HOY" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, minHeight: 48, p: 0, '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A', [DESKTOP]: { fontSize: '14px', px: '24px' }, [TABLET]: { fontSize: '14px', px: '24px' }, [MOBILE]: { fontSize: '12px', px: '8px' } }} />
          <Tab label="SEMANA" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, minHeight: 48, p: 0, '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A', [DESKTOP]: { fontSize: '14px', px: '24px' }, [TABLET]: { fontSize: '14px', px: '24px' }, [MOBILE]: { fontSize: '12px', px: '8px' } }} />
          <Tab label="FECHAS BLOQUEADAS" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, minHeight: 48, p: 0, '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A', [DESKTOP]: { fontSize: '14px', px: '24px' }, [TABLET]: { fontSize: '14px', px: '24px' }, [MOBILE]: { fontSize: '12px', px: '8px' } }} />
        </Tabs>

        {/* --- TAB 1: HOY --- */}
        {currentTab === 0 && (
          <Box sx={{ [DESKTOP]: { p: '24px' }, [TABLET]: { p: '24px' }, [MOBILE]: { p: '16px' } }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', mb: '20px',
              [DESKTOP]: { justifyContent: 'space-between', flexDirection: 'row' },
              [TABLET]: { justifyContent: 'space-between', flexDirection: 'row' },
              [MOBILE]: { justifyContent: 'space-between', flexDirection: 'row', width: '100%' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconButton onClick={() => handleDateChange(-1)} size="small" sx={{ border: '1px solid #70757A', width: 28, height: 28 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>keyboard_arrow_left</span>
                </IconButton>
                <Typography sx={{ 
                  fontFamily: 'Roboto', fontWeight: 500, color: '#202124', textAlign: 'center',
                  [DESKTOP]: { fontSize: '16px', width: 180 },
                  [TABLET]: { fontSize: '16px', width: 180 },
                  [MOBILE]: { fontSize: '14px', flex: 1, minWidth: 120 }
                }}>
                  {dateFormatted}
                </Typography>
                <IconButton onClick={() => handleDateChange(1)} size="small" sx={{ border: '1px solid #70757A', width: 28, height: 28 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>keyboard_arrow_right</span>
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <Box 
                  onClick={toggleDayStatusInstant}
                  sx={{ 
                    bgcolor: selectedDayStatus.status === 'CERRADO' ? '#FDECEA' : '#E8F0FE',
                    color: selectedDayStatus.status === 'CERRADO' ? '#D93025' : '#1A73E8',
                    px: '16px', py: '4px', borderRadius: '16px', cursor: 'pointer', userSelect: 'none'
                  }}
                >
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>
                    {selectedDayStatus.status === 'CERRADO' ? 'Cerrado' : 'Abierto'}
                  </Typography>
                </Box>
                {selectedDayStatus.status === 'CERRADO' && selectedDayStatus.reason && (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontStyle: 'italic', pr: '8px' }}>
                    Cerrado · {selectedDayStatus.reason}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', mb: '24px',
              [DESKTOP]: { gap: '24px', flexDirection: 'row' },
              [TABLET]: { gap: '24px', flexDirection: 'row' },
              [MOBILE]: { gap: '8px', flexDirection: 'column' }
            }}>
              <Button 
                variant="outlined"
                sx={{ 
                  p: 0, textTransform: 'none', color: '#1A73E8', borderColor: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px',
                  [DESKTOP]: { border: 'none', minHeight: 0 },
                  [TABLET]: { border: 'none', minHeight: 0 },
                  [MOBILE]: { width: '100%', height: 44, borderRadius: '4px' } 
                }} 
                onClick={() => toggleAllInstant(true)}
              >
                Abrir todos
              </Button>
              <Button 
                variant="outlined"
                sx={{ 
                  p: 0, textTransform: 'none', color: '#D93025', borderColor: '#D93025', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px',
                  [DESKTOP]: { border: 'none', minHeight: 0 },
                  [TABLET]: { border: 'none', minHeight: 0 },
                  [MOBILE]: { width: '100%', height: 44, borderRadius: '4px' } 
                }} 
                onClick={() => toggleAllInstant(false)}
              >
                Cerrar todos
              </Button>
            </Box>

            {currentDaySchedule.shifts.map((shift, idx) => (
              <Box key={`${shift.id}-${idx}`} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', mr: 2 }}>
                    Turno {idx + 1} ({shift.openingTime} – {shift.closingTime} {toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? '' : ''})
                  </Typography>
                  <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#E0E0E0' }}></Box>
                </Box>
                <Box sx={{ 
                  display: 'grid', 
                  [DESKTOP]: { gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' },
                  [TABLET]: { gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
                  [MOBILE]: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }
                }}>
                  {Object.keys(shift.slots).sort().map(time => {
                    const isOpen = shift.slots[time] && currentDaySchedule.open;
                    return (
                      <Box key={time} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box 
                          onClick={() => { if(currentDaySchedule.open) toggleSlotInstant(time, shift.id); }}
                          sx={{
                            width: '100%', borderRadius: '4px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            cursor: currentDaySchedule.open ? 'pointer' : 'not-allowed',
                            bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                            border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                            color: isOpen ? '#1A73E8' : '#BDBDBD', userSelect: 'none', mb: '4px',
                            [DESKTOP]: { height: 48 },
                            [TABLET]: { height: 48 },
                            [MOBILE]: { height: 44 }
                          }}
                        >
                          <Typography sx={{ 
                            fontFamily: 'Roboto', fontWeight: 500, 
                            [DESKTOP]: { fontSize: '14px' },
                            [TABLET]: { fontSize: '14px' },
                            [MOBILE]: { fontSize: '13px' }
                          }}>{time}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* --- TAB 2: SEMANA --- */}
        {currentTab === 1 && (
          <Box sx={{ [DESKTOP]: { p: '24px' }, [TABLET]: { p: '24px' }, [MOBILE]: { p: '16px' } }}>
            <Box sx={{ mb: '24px' }}>
              <Button sx={{ textTransform: 'none', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', p: 0, [MOBILE]: { minHeight: 44 } }} onClick={copyMondayToAll}>
                Copiar de Lunes a todos los días
              </Button>
            </Box>

            {DAYS.map(day => {
              const dayConfig = config.schedule[day];
              const totalOpenCount = dayConfig.shifts.reduce((acc, s) => acc + Object.values(s.slots).filter(Boolean).length, 0);
              const summaryRanges = dayConfig.shifts.map(s => `${s.openingTime}–${s.closingTime}${toMinutes(s.closingTime) <= toMinutes(s.openingTime) ? '' : ''}`).join(' · ');
              const sameInterval = dayConfig.shifts.length > 0 && dayConfig.shifts.every(s => s.interval === dayConfig.shifts[0].interval);
              const summaryInterval = sameInterval && dayConfig.shifts.length > 0 ? `${dayConfig.shifts[0].interval}min` : 'Mix';
              const hasOverlap = dayConfig.shifts.length === 2 && (() => {
                  let s1Open  = toMinutes(dayConfig.shifts[0].openingTime);
                  let s1Close = toMinutes(dayConfig.shifts[0].closingTime);
                  let s2Open  = toMinutes(dayConfig.shifts[1].openingTime);
                  let s2Close = toMinutes(dayConfig.shifts[1].closingTime);

                  if (s1Close <= s1Open) s1Close += 1440;
                  if (s2Close <= s2Open) s2Close += 1440;
                  if (s2Open < s1Open) { s2Open += 1440; s2Close += 1440; }

                  return s2Open < s1Close;
              })();

              return (
                <Accordion disableGutters key={day} sx={{ mb: '8px', border: '1px solid #E0E0E0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<span className="material-icons">expand_more</span>} sx={{ minHeight: 56, height: 56, px: '16px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124', width: { xs: 80, sm: 100 } }}>
                        {DAY_LABELS[day]}
                      </Typography>
                      {!dayConfig.open ? (
                        <Typography sx={{ fontFamily: 'Roboto', color: '#D93025', fontSize: '14px', fontWeight: 500 }}>Cerrado</Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', flex: 1 }}>
                            {summaryRanges}
                          </Typography>
                          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', display: { xs: 'none', sm: 'block' } }}>
                            {summaryInterval}
                          </Typography>
                          <Typography sx={{ fontFamily: 'Roboto', color: '#70757A', fontSize: '14px', display: { xs: 'none', sm: 'block' } }}>
                            {totalOpenCount} slots
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ pt: 0, pb: '24px', px: { xs: '16px', md: '24px' }, borderTop: '1px solid #E0E0E0', position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>Config de {DAY_LABELS[day]}</Typography>
                      <Box 
                        onClick={() => toggleDayStatusWeekly(day)}
                        sx={{ bgcolor: dayConfig.open ? '#E8F0FE' : '#FDECEA', color: dayConfig.open ? '#1A73E8' : '#D93025', px: '16px', py: '4px', borderRadius: '16px', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>{dayConfig.open ? 'Abierto' : 'Cerrado'}</Typography>
                      </Box>
                    </Box>

                    {!dayConfig.open ? (
                      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', bgcolor: '#F1F3F4', borderRadius: '4px' }}>
                         <Typography sx={{ color: '#70757A', fontFamily: 'Roboto', fontSize: '14px', textAlign: 'center' }}>Restaurante cerrado este día.</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {dayConfig.shifts.map((shift, idx) => {
                          const oMins = toMinutes(shift.openingTime);
                          let cMins = toMinutes(shift.closingTime);
                          if (cMins <= oMins) cMins += 1440;
                          const isValid = (cMins - oMins) >= 30;

                          return (
                            <Box key={`${shift.id}-${idx}`} sx={{ bgcolor: '#FFF', border: `1px solid ${!isValid ? '#D93025' : '#E0E0E0'}`, borderRadius: '4px', p: { xs: '12px', md: '16px' } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#70757A' }}>Turno {idx + 1} &nbsp;&nbsp; {shift.openingTime} – {shift.closingTime} <span style={{fontSize: '11px'}}>{toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? '' : ''}</span></Typography>
                                {idx === 1 && (
                                  <IconButton size="small" onClick={() => removeShift(day, shift.id)}>
                                    <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>close</span>
                                  </IconButton>
                                )}
                              </Box>

                              <Box sx={{ borderBottom: '1px solid #E0E0E0', pb: '16px' }}>
                                <Box sx={{ 
                                  display: 'grid', 
                                  [DESKTOP]: { gridTemplateColumns: 'min-content min-content min-content auto', gap: '24px', alignItems: 'flex-end' },
                                  [TABLET]: { gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' },
                                  [MOBILE]: { gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'flex-end' }
                                }}>
                                  <Box sx={{ width: '100%' }}>
                                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Apertura</Typography>
                                    <FormControl size="small" sx={{ width: '100%' }}>
                                      <Select value={shift.openingTime} onChange={(e) => updateShiftConfig(day, shift.id, 'openingTime', e.target.value)} sx={{ height: { xs: 52, md: 36 }, fontSize: { xs: '16px', md: '14px' }, borderRadius: '4px', fontFamily: 'Roboto', color: '#202124' }}>
                                        {TIME_OPTIONS.filter(t => {
                                          const tMins = toMinutes(t);
                                          const gOpenMins = toMinutes(globalHours.openingTime);
                                          let gCloseMins = toMinutes(globalHours.closingTime);
                                          if (gCloseMins <= gOpenMins) gCloseMins += 1440;
                                          let effT = tMins;
                                          if (tMins < gOpenMins) effT += 1440;
                                          return effT >= gOpenMins && effT < gCloseMins;
                                        }).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  <Box sx={{ width: '100%' }}>
                                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Cierre</Typography>
                                    <FormControl size="small" sx={{ width: '100%' }}>
                                      <Select value={shift.closingTime} onChange={(e) => updateShiftConfig(day, shift.id, 'closingTime', e.target.value)} sx={{ height: { xs: 52, md: 36 }, fontSize: { xs: '16px', md: '14px' }, borderRadius: '4px', fontFamily: 'Roboto', color: '#202124' }}>
                                        {TIME_OPTIONS.map(t => {
                                          const tMins = toMinutes(t);
                                          const sOpenMins = toMinutes(shift.openingTime);
                                          const isNextDay = tMins <= sOpenMins;
                                          return (
                                            <MenuItem key={t} value={t}>
                                              {t}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  <Box sx={{ width: '100%' }}>
                                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', mb: '4px', textTransform: 'uppercase' }}>Intervalo</Typography>
                                    <FormControl size="small" sx={{ width: '100%' }}>
                                      <Select value={shift.interval} onChange={(e) => updateShiftConfig(day, shift.id, 'interval', parseInt(e.target.value))}  sx={{ height: { xs: 52, md: 36 }, fontSize: { xs: '16px', md: '14px' }, borderRadius: '4px', fontFamily: 'Roboto', color: '#202124' }}>
                                        {INTERVAL_OPTIONS.map(i => <MenuItem key={i} value={i}>{i} min</MenuItem>)}
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                                    <Button 
                                      variant="outlined" disabled={!isValid} onClick={() => handleRegenerateSlots(day, shift.id)}
                                      sx={{ 
                                        width: '100%', height: { xs: 52, md: 36 }, borderRadius: '4px', color: '#1A73E8', borderColor: '#1A73E8',
                                        fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'none',
                                        '&.Mui-disabled': { borderColor: '#E0E0E0', color: '#BDBDBD' }
                                      }}
                                      startIcon={<span className="material-icons" style={{ fontSize: 16 }}>refresh</span>}
                                    >
                                      Regenerar franjas
                                    </Button>
                                  </Box>
                                </Box>
                                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '11px', color: '#70757A', mt: '8px' }}>
                                  Horario permitido: {globalHours.openingTime} – {globalHours.closingTime} {toMinutes(globalHours.closingTime) <= toMinutes(globalHours.openingTime) ? '' : ''}
                                </Typography>
                                {regenMsg?.day === day && regenMsg?.shiftId === shift.id && (
                                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#1A73E8', mt: '8px' }}>{regenMsg.msg}</Typography>
                                )}
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: '12px' }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  [DESKTOP]: { gap: '24px' }, [TABLET]: { gap: '24px' }, [MOBILE]: { gap: '8px', width: '100%', flexDirection: 'column' }
                                }}>
                                  <Button sx={{ 
                                    textTransform: 'none', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', 
                                    [MOBILE]: { width: '100%', height: 44, border: '1px solid currentColor' },
                                    [TABLET]: { p: 0 }, [DESKTOP]: { p: 0 } 
                                  }} onClick={() => toggleAllWeekly(day, shift.id, true)}>
                                    Abrir todos
                                  </Button>
                                  <Button sx={{ 
                                    textTransform: 'none', color: '#D93025', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px',
                                    [MOBILE]: { width: '100%', height: 44, border: '1px solid currentColor' },
                                    [TABLET]: { p: 0 }, [DESKTOP]: { p: 0 }
                                  }} onClick={() => toggleAllWeekly(day, shift.id, false)}>
                                    Cerrar todos
                                  </Button>
                                </Box>
                              </Box>

                              <Box sx={{ 
                                display: 'grid', 
                                [DESKTOP]: { gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', mt: '12px' },
                                [TABLET]: { gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', mt: '12px' },
                                [MOBILE]: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', mt: '12px' }
                              }}>
                                {Object.keys(shift.slots).sort().map(time => {
                                  const isOpen = shift.slots[time];
                                  return (
                                    <Box 
                                      key={time} onClick={() => toggleSlotWeekly(day, shift.id, time) }
                                      sx={{
                                        width: '100%', height: { xs: 44, md: 40 }, borderRadius: '4px',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                                        bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                                        border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                                        color: isOpen ? '#1A73E8' : '#BDBDBD', userSelect: 'none',
                                      }}
                                    >
                                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: { xs: '13px', md: '14px' } }}>{time}</Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          );
                        })}

                        {hasOverlap && <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#D93025', textAlign: 'center' }}>El turno 2 se solapa</Typography>}

                        {dayConfig.shifts.length === 1 && (
                          <Box sx={{ display: 'flex' }}>
                             <Button 
                               variant="outlined" onClick={() => addShift(day)} startIcon={<span className="material-icons" style={{ fontSize: 16 }}>add</span>}
                               sx={{ height: 44, px: '16px', borderRadius: '4px', color: '#1A73E8', borderColor: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'none', [MOBILE]: { width: '100%' } }}
                             >
                               Añadir turno 2
                             </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'flex-end', [MOBILE]: { mt: '16px' } }}>
              <Button 
                variant="contained" onClick={manualSave} disabled={saving} 
                sx={{ 
                  height: { xs: 44, md: 36 }, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
                  [MOBILE]: { width: '100%' }
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR PLANTILLA'}
              </Button>
            </Box>
          </Box>
        )}

        {/* --- TAB 3: FECHAS BLOQUEADAS --- */}
        {currentTab === 2 && (
          <Box sx={{ 
            display: 'flex', alignItems: 'flex-start',
            [DESKTOP]: { gap: '24px', flexDirection: 'row', p: '24px' },
            [TABLET]: { gap: '24px', flexDirection: 'column', p: '24px' },
            [MOBILE]: { gap: '24px', flexDirection: 'column', p: '16px' }
          }}>
            
            <Paper sx={{ 
              flexShrink: 0, p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none',
              [DESKTOP]: { width: 400 },
              [TABLET]: { width: '100%' },
              [MOBILE]: { width: '100%', p: '16px' }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '24px' }}>
                <IconButton onClick={() => changeBlockMonth(-1)} size="small" sx={{ color: '#70757A' }}>
                  <span className="material-icons" style={{ fontSize: 20 }}>keyboard_arrow_left</span>
                </IconButton>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', width: 140, textAlign: 'center', color: '#202124' }}>
                  {MONTH_NAMES[blockMonthStart.getMonth()]} {blockMonthStart.getFullYear()}
                </Typography>
                <IconButton onClick={() => changeBlockMonth(1)} size="small" sx={{ color: '#70757A' }}>
                  <span className="material-icons" style={{ fontSize: 20 }}>keyboard_arrow_right</span>
                </IconButton>
              </Box>

              {renderMonthGrid()}

              {blockingDate && (
                <Box sx={{ 
                  mt: '12px', p: '12px', bgcolor: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: '4px' 
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124', mb: '12px' 
                  }}>
                    Bloquear {blockingDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '4px' 
                  }}>
                    Motivo (opcional)
                  </Typography>
                  <TextField 
                    fullWidth
                    size="small"
                    placeholder="Evento privado, Vacaciones, Mantenimiento..."
                    value={blockingReason}
                    onChange={(e) => setBlockingReason(e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: '4px', height: '44px', fontSize: '14px', fontFamily: 'Roboto' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', mt: '12px' }}>
                    <Button 
                      onClick={() => setBlockingDate(null)}
                      sx={{ 
                        height: '36px', px: '16px', borderRadius: '4px', border: '1px solid #DADCE0', 
                        color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px'
                      }}
                    >
                      CANCELAR
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={confirmBlock}
                      sx={{ 
                        height: '36px', px: '16px', borderRadius: '4px', bgcolor: '#1A73E8', color: '#FFFFFF',
                        fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', boxShadow: 'none',
                        '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                      }}
                    >
                      BLOQUEAR DÍA
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>

            <Box sx={{ flex: 1, minHeight: 100, width: '100%' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', mb: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                Fechas Bloqueadas
              </Typography>
              
              {blockedDates.length === 0 && !blockedMeta ? (
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>No hay fechas bloqueadas</Typography>
              ) : (
                <Box>
                  {blockedDates.length === 0 ? (
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>No hay fechas bloqueadas</Typography>
                  ) : (
                    <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                      {blockedDates.map((item, idx) => {
                        const dateStr = item.date || item;
                        const d = new Date(dateStr + 'T12:00:00');
                        const dayLabel = DAY_LABELS[dayNameMapping[d.getDay()]] || '---';
                        const monthName = (MONTH_NAMES[d.getMonth()] || '').toLowerCase();
                        const label = isNaN(d.getTime()) ? dateStr : `${dayLabel}, ${d.getDate()} de ${monthName} ${d.getFullYear()}`;
                        return (
                          <Box key={item.date} sx={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            p: '16px', borderBottom: idx < blockedDates.length - 1 ? '1px solid #E0E0E0' : 'none' 
                          }}>
                            <Box>
                              <Typography sx={{ fontFamily: 'Roboto', color: '#202124', fontSize: '14px', fontWeight: 500 }}>
                                {label}
                              </Typography>
                              {item.reason && (
                                <Typography sx={{ fontFamily: 'Roboto', color: '#70757A', fontSize: '12px', mt: '2px' }}>
                                  {item.reason}
                                </Typography>
                              )}
                            </Box>
                            <IconButton size="small" onClick={() => unblockDate(item.date)} sx={{ color: '#D93025' }}>
                              <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  {blockedMeta && blockedMeta.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', mt: '12px' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#70757A' }}>
                        {blockedMeta.current_page} / {blockedMeta.last_page}
                      </Typography>
                      <IconButton size="small" disabled={blockedMeta.current_page <= 1} onClick={() => setBlockedPage(p => p - 1)} sx={{ width: 28, height: 28, border: '1px solid #DADCE0', borderRadius: '4px', '&.Mui-disabled': { borderColor: '#E0E0E0' } }}>
                        <span className="material-icons" style={{ fontSize: 16, color: blockedMeta.current_page <= 1 ? '#BDBDBD' : '#70757A' }}>chevron_left</span>
                      </IconButton>
                      <IconButton size="small" disabled={blockedMeta.current_page >= blockedMeta.last_page} onClick={() => setBlockedPage(p => p + 1)} sx={{ width: 28, height: 28, border: '1px solid #DADCE0', borderRadius: '4px', '&.Mui-disabled': { borderColor: '#E0E0E0' } }}>
                        <span className="material-icons" style={{ fontSize: 16, color: blockedMeta.current_page >= blockedMeta.last_page ? '#BDBDBD' : '#70757A' }}>chevron_right</span>
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

          </Box>
        )}
      </Paper>

      <Snackbar
        open={toastOpen} autoHideDuration={2000} onClose={() => setToastOpen(false)} message="Cambios guardados" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: '#323232', color: '#FFFFFF', borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px' } }}
      />
    </Box>
  );
}
