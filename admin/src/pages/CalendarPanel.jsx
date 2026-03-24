import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Box, Paper, Button, IconButton, 
  CircularProgress, Snackbar, Tabs, Tab, Accordion, 
  AccordionSummary, AccordionDetails, Select, MenuItem, FormControl
} from '@mui/material';
import { apiClient } from '../services/apiClient';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
const DEFAULT_SLOTS = ["13:00", "13:30", "14:00", "14:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];
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

export default function CalendarPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Cambios guardados");
  const [regenMsg, setRegenMsg] = useState(null);
  
  // For Blocked Days Tab Calendar
  const [blockMonthStart, setBlockMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await apiClient('/config');
      const schedule = data.schedule || {};
      DAYS.forEach(day => {
        if (!schedule[day]) schedule[day] = { open: true, slots: {} };
        if (schedule[day].openingTime === undefined) schedule[day].openingTime = '09:00';
        if (schedule[day].closingTime === undefined) schedule[day].closingTime = '23:30';
        if (schedule[day].interval === undefined) schedule[day].interval = 30;

        if (Object.keys(schedule[day].slots || {}).length === 0) {
           const slotsObj = {};
           DEFAULT_SLOTS.forEach(time => slotsObj[time] = true);
           schedule[day].slots = slotsObj;
        }
      });
      setConfig({
        ...data,
        schedule,
        blockedDays: data.blockedDays || []
      });
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
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const manualSave = async (msg = "Cambios guardados") => {
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

  if (loading || !config) {
    return <Box p={4}><CircularProgress /></Box>;
  }

  // --- TAB 1 (HOY) UTILS --- //
  const handleDateChange = (daysToAdd) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + daysToAdd);
    setSelectedDate(nextDate);
  };

  const jsDayIndex = selectedDate.getDay();
  // js getDay: Sun = 0, Mon = 1 ... Sat = 6. Our DAYS array starts at monday.
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

  const toggleSlotInstant = (time) => {
    const newConfig = {
      ...config,
      schedule: {
        ...config.schedule,
        [currentDayKey]: {
          ...currentDaySchedule,
          slots: {
            ...currentDaySchedule.slots,
            [time]: !currentDaySchedule.slots[time]
          }
        }
      }
    };
    saveConfigState(newConfig, true);
  };

  const toggleAllInstant = (status) => {
    const newSlots = { ...currentDaySchedule.slots };
    Object.keys(newSlots).forEach(time => {
      newSlots[time] = status;
    });
    const newConfig = {
      ...config,
      schedule: {
        ...config.schedule,
        [currentDayKey]: {
          ...currentDaySchedule,
          slots: newSlots
        }
      }
    };
    saveConfigState(newConfig, true);
  };

  // --- TAB 2 (SEMANA) UTILS --- //
  const updateDayConfig = (day, field, value) => {
    setConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleRegenerateSlots = (day) => {
    setConfig(prev => {
      const dayConf = prev.schedule[day];
      const [openH, openM] = dayConf.openingTime.split(':').map(Number);
      const [closeH, closeM] = dayConf.closingTime.split(':').map(Number);
      
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;
      
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += dayConf.interval) {
        const h = String(Math.floor(t / 60)).padStart(2, '0');
        const m = String(t % 60).padStart(2, '0');
        newSlots[`${h}:${m}`] = true;
      }
      
      setRegenMsg({ day, msg: `✓ Slots regenerados: ${Object.keys(newSlots).length} franjas de ${dayConf.interval} min` });
      setTimeout(() => setRegenMsg(null), 3000);
      
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...dayConf,
            slots: newSlots
          }
        }
      };
    });
  };

  const copyMondayToAll = () => {
    const monSchedule = config.schedule.monday;
    const [openH, openM] = monSchedule.openingTime.split(':').map(Number);
    const [closeH, closeM] = monSchedule.closingTime.split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    
    const newSlots = {};
    for (let t = openMin; t <= closeMin; t += monSchedule.interval) {
      const h = String(Math.floor(t / 60)).padStart(2, '0');
      const m = String(t % 60).padStart(2, '0');
      newSlots[`${h}:${m}`] = true;
    }

    const newSchedule = { ...config.schedule };
    DAYS.forEach(day => {
      newSchedule[day] = {
        ...newSchedule[day],
        openingTime: monSchedule.openingTime,
        closingTime: monSchedule.closingTime,
        interval: monSchedule.interval,
        slots: { ...newSlots }
      };
    });
    
    setConfig({ ...config, schedule: newSchedule });
    setToastMessage("Plantilla de Lunes aplicada a todos los días");
    setToastOpen(true);
  };

  const toggleDayStatusWeekly = (day) => {
    setConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], open: !prev.schedule[day].open }
      }
    }));
  };

  const toggleSlotWeekly = (day, time) => {
    setConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          slots: {
            ...prev.schedule[day].slots,
            [time]: !prev.schedule[day].slots[time]
          }
        }
      }
    }));
  };

  const toggleAllWeekly = (day, status) => {
    setConfig(prev => {
      const newSlots = { ...prev.schedule[day].slots };
      Object.keys(newSlots).forEach(t => newSlots[t] = status);
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            slots: newSlots
          }
        }
      };
    });
  };

  // --- TAB 3 (FECHAS BLOQUEADAS) UTILS --- //
  const changeBlockMonth = (months) => {
    const nextMonth = new Date(blockMonthStart);
    nextMonth.setMonth(blockMonthStart.getMonth() + months);
    setBlockMonthStart(nextMonth);
  };

  const isBlocked = (dateStr) => config.blockedDays.includes(dateStr);

  const toggleBlockDate = (dateOb) => {
    const yyyy = dateOb.getFullYear();
    const mm = String(dateOb.getMonth() + 1).padStart(2, '0');
    const dd = String(dateOb.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setConfig(prev => {
      let nextBlocks = [...prev.blockedDays];
      if (nextBlocks.includes(dateStr)) {
        nextBlocks = nextBlocks.filter(d => d !== dateStr);
      } else {
        nextBlocks.push(dateStr);
      }
      return { ...prev, blockedDays: nextBlocks.sort() };
    });
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
      if (blocked) {
        bg = '#FDECEA';
        color = '#D93025';
      } else if (isToday) {
        bg = '#E8F0FE';
        color = '#1A73E8';
      }

      cells.push(
        <Box key={i} sx={{ width: '14.28%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0.5 }}>
          <Box 
            onClick={() => toggleBlockDate(d)}
            sx={{ 
              width: 32, height: 32, borderRadius: '50%', bgcolor: bg, color: color,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: blocked ? '#F8D8D5' : '#F1F3F4' }
            }}
          >
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: (isToday || blocked) ? 500 : 400 }}>{i}</Typography>
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
        {cells}
      </Box>
    );
  };


  return (
    <Box sx={{ pb: 8, width: '100%' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: '24px' }}>
        Calendar Control
      </Typography>

      <Paper sx={{ width: '100%', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', p: 0, overflow: 'hidden' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#1A73E8', height: 2 } }}
          sx={{ borderBottom: '1px solid #E0E0E0', minHeight: 48, height: 48 }}
        >
          <Tab label="HOY" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minHeight: 48, px: '24px', '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A' }} />
          <Tab label="SEMANA" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minHeight: 48, px: '24px', '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A' }} />
          <Tab label="FECHAS BLOQUEADAS" sx={{ textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minHeight: 48, px: '24px', '&.Mui-selected': { color: '#1A73E8' }, color: '#70757A' }} />
        </Tabs>

        {/* --- TAB 1: HOY --- */}
        {currentTab === 0 && (
          <Box sx={{ p: '24px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconButton onClick={() => handleDateChange(-1)} size="small" sx={{ border: '1px solid #70757A', width: 28, height: 28 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>keyboard_arrow_left</span>
                </IconButton>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', width: 180, textAlign: 'center' }}>
                  {dateFormatted}
                </Typography>
                <IconButton onClick={() => handleDateChange(1)} size="small" sx={{ border: '1px solid #70757A', width: 28, height: 28 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>keyboard_arrow_right</span>
                </IconButton>
              </Box>

              <Box 
                onClick={toggleDayStatusInstant}
                sx={{ 
                  bgcolor: currentDaySchedule.open ? '#E8F0FE' : '#FDECEA',
                  color: currentDaySchedule.open ? '#1A73E8' : '#D93025',
                  px: '16px', py: '4px', borderRadius: '16px', cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>
                  {currentDaySchedule.open ? 'Abierto' : 'Cerrado'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: '24px', mb: '24px' }}>
              <Button sx={{ p: 0, textTransform: 'none', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }} onClick={() => toggleAllInstant(true)}>
                Abrir todos
              </Button>
              <Button sx={{ p: 0, textTransform: 'none', color: '#D93025', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }} onClick={() => toggleAllInstant(false)}>
                Cerrar todos
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {Object.keys(currentDaySchedule.slots).sort().map(time => {
                const isOpen = currentDaySchedule.slots[time] && currentDaySchedule.open;
                return (
                  <Box key={time} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box 
                      onClick={() => { if(currentDaySchedule.open) toggleSlotInstant(time); }}
                      sx={{
                        width: '100%', height: 48, borderRadius: '4px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: currentDaySchedule.open ? 'pointer' : 'not-allowed',
                        bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                        border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                        color: isOpen ? '#1A73E8' : '#BDBDBD',
                        userSelect: 'none',
                        mb: '4px'
                      }}
                    >
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>{time}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* --- TAB 2: SEMANA --- */}
        {currentTab === 1 && (
          <Box sx={{ p: '24px' }}>
            <Box sx={{ mb: '24px' }}>
              <Button sx={{ textTransform: 'none', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', p: 0 }} onClick={copyMondayToAll}>
                Copiar de Lunes a todos los días
              </Button>
            </Box>

            {DAYS.map(day => {
              const dayConfig = config.schedule[day];
              const openCount = Object.values(dayConfig.slots).filter(Boolean).length;
              
              const [openH, openM] = dayConfig.openingTime.split(':').map(Number);
              const [closeH, closeM] = dayConfig.closingTime.split(':').map(Number);
              const openMin = openH * 60 + openM;
              const closeMin = closeH * 60 + closeM;
              
              const isValid = closeMin > openMin;
              const slotsCountVal = Math.floor((closeMin - openMin) / dayConfig.interval) + 1;
              const isTooFew = slotsCountVal <= 1;

              return (
                <Accordion disableGutters key={day} sx={{ mb: '8px', border: '1px solid #E0E0E0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<span className="material-icons">expand_more</span>} sx={{ minHeight: 56, height: 56, px: '16px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124', width: 100 }}>
                        {DAY_LABELS[day]}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', width: 140 }}>
                        {dayConfig.openingTime} – {dayConfig.closingTime}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', width: 60 }}>
                        {dayConfig.interval}min
                      </Typography>
                      <Typography sx={{ fontFamily: 'Roboto', color: '#70757A', fontSize: '14px' }}>
                        {dayConfig.open ? `${openCount} slots abiertos` : 'Cerrado'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: '24px', px: '24px', borderTop: '1px solid #E0E0E0' }}>
                    
                    <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-end', py: '16px', borderBottom: '1px solid #E0E0E0' }}>
                      <Box>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '4px' }}>Apertura</Typography>
                        <FormControl size="small">
                          <Select 
                            value={dayConfig.openingTime} 
                            onChange={(e) => updateDayConfig(day, 'openingTime', e.target.value)}
                            sx={{ height: 36, minWidth: 100, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}
                          >
                            {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '4px' }}>Cierre</Typography>
                        <FormControl size="small">
                          <Select 
                            value={dayConfig.closingTime} 
                            onChange={(e) => updateDayConfig(day, 'closingTime', e.target.value)}
                            sx={{ height: 36, minWidth: 100, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}
                          >
                            {TIME_OPTIONS.map(t => <MenuItem key={t} value={t} disabled={parseInt(t.replace(':', '')) <= parseInt(dayConfig.openingTime.replace(':', ''))}>{t}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '4px' }}>Intervalo</Typography>
                        <FormControl size="small">
                          <Select 
                            value={dayConfig.interval} 
                            onChange={(e) => updateDayConfig(day, 'interval', parseInt(e.target.value))}
                            sx={{ height: 36, minWidth: 100, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}
                          >
                            {INTERVAL_OPTIONS.map(i => <MenuItem key={i} value={i}>{i} min</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                        <Button 
                          variant="outlined" 
                          disabled={!isValid || isTooFew}
                          onClick={() => handleRegenerateSlots(day)}
                          sx={{ 
                            height: 36, px: '16px', borderRadius: '4px', color: '#1A73E8', borderColor: '#1A73E8',
                            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'none',
                            '&.Mui-disabled': { borderColor: '#E0E0E0', color: '#BDBDBD' }
                          }}
                          startIcon={<span className="material-icons" style={{ fontSize: 16 }}>refresh</span>}
                        >
                          Regenerar slots
                        </Button>
                      </Box>
                    </Box>

                    {!isValid && (
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#D93025', mt: '16px' }}>
                        La hora de cierre debe ser posterior a la apertura
                      </Typography>
                    )}
                    {isValid && isTooFew && (
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#F9AB00', mt: '16px' }}>
                        Este intervalo genera muy pocos slots
                      </Typography>
                    )}
                    {regenMsg?.day === day && (
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#1A73E8', mt: '16px', transition: 'opacity 0.5s' }}>
                        {regenMsg.msg}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px' }}>
                      <Box sx={{ display: 'flex', gap: '24px' }}>
                        <Button sx={{ p: 0, textTransform: 'none', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }} onClick={() => toggleAllWeekly(day, true)}>
                          Abrir todos
                        </Button>
                        <Button sx={{ p: 0, textTransform: 'none', color: '#D93025', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }} onClick={() => toggleAllWeekly(day, false)}>
                          Cerrar todos
                        </Button>
                      </Box>
                      <Box 
                        onClick={() => toggleDayStatusWeekly(day)}
                        sx={{ 
                          bgcolor: dayConfig.open ? '#E8F0FE' : '#FDECEA',
                          color: dayConfig.open ? '#1A73E8' : '#D93025',
                          px: '16px', py: '4px', borderRadius: '16px', cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>
                          {dayConfig.open ? 'Abierto' : 'Cerrado'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                      {Object.keys(dayConfig.slots).sort().map(time => {
                        const isOpen = dayConfig.slots[time] && dayConfig.open;
                        return (
                          <Box 
                            key={time}
                            onClick={() => { if(dayConfig.open) toggleSlotWeekly(day, time); }}
                            sx={{
                              width: '100%', height: 48, borderRadius: '4px',
                              display: 'flex', justifyContent: 'center', alignItems: 'center',
                              cursor: dayConfig.open ? 'pointer' : 'not-allowed',
                              bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                              border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                              color: isOpen ? '#1A73E8' : '#BDBDBD',
                              userSelect: 'none',
                            }}
                          >
                            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px' }}>{time}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={manualSave} 
                disabled={saving} 
                sx={{ 
                  height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                  '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR PLANTILLA'}
              </Button>
            </Box>
          </Box>
        )}

        {/* --- TAB 3: FECHAS BLOQUEADAS --- */}
        {currentTab === 2 && (
          <Box sx={{ p: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            
            <Paper sx={{ width: 400, flexShrink: 0, p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
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
              
              <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  onClick={manualSave} 
                  disabled={saving} 
                  sx={{ 
                    height: 36, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                    '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'GUARDAR FECHAS'}
                </Button>
              </Box>
            </Paper>

            <Box sx={{ flex: 1, minHeight: 100 }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', mb: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                Fechas Bloqueadas
              </Typography>
              
              {config.blockedDays.length === 0 ? (
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>No hay fechas bloqueadas</Typography>
              ) : (
                <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                  {config.blockedDays.map((dateStr, idx) => {
                    const d = new Date(dateStr);
                    const label = `${DAY_LABELS[dayNameMapping[d.getDay()]]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
                    return (
                      <Box key={dateStr} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px', borderBottom: idx < config.blockedDays.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                        <Typography sx={{ fontFamily: 'Roboto', color: '#202124', fontSize: '14px' }}>{label}</Typography>
                        <IconButton size="small" onClick={() => toggleBlockDate(new Date(dateStr))} sx={{ color: '#D93025' }}>
                          <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

          </Box>
        )}
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        message="Cambios guardados"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: { bgcolor: '#323232', color: '#FFFFFF', borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px' }
        }}
      />
    </Box>
  );
}
