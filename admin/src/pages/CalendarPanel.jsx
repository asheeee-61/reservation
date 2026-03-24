import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Box, Paper, Grid, Button, IconButton, 
  CircularProgress, Snackbar, Tabs, Tab, Accordion, 
  AccordionSummary, AccordionDetails
} from '@mui/material';
import { apiClient } from '../services/apiClient';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
const DEFAULT_SLOTS = ["13:00", "13:30", "14:00", "14:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toastOpen, setToastOpen] = useState(false);
  
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
        if (Object.keys(schedule[day].slots || {}).length === 0) {
           const slotsObj = {};
           DEFAULT_SLOTS.forEach(time => slotsObj[time] = true);
           schedule[day].slots = slotsObj;
        }
      });
      const capacity = data.capacity || {};
      DEFAULT_SLOTS.forEach(time => {
         if (capacity[time] === undefined) capacity[time] = 20;
      });

      setConfig({
        ...data,
        schedule,
        blockedDays: data.blockedDays || [],
        capacity
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
      if (showToast) setToastOpen(true);
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const manualSave = async () => {
    setSaving(true);
    try {
      await apiClient('/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
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
  const copyMondayToAll = () => {
    const monSchedule = config.schedule.monday;
    const newSchedule = { ...config.schedule };
    DAYS.forEach(day => {
      newSchedule[day] = JSON.parse(JSON.stringify(monSchedule));
    });
    setConfig({ ...config, schedule: newSchedule });
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
    // js day: 0=Sun, 1=Mon. Our cal starts Mon.
    let leadingEmptyDays = currentDayStr === 0 ? 6 : currentDayStr - 1;

    const daysInMonth = endOfMonth.getDate();
    const cells = [];

    // Header abbreviations
    const dayHeaders = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    dayHeaders.forEach(dh => {
      cells.push(
        <Box key={dh} sx={{ width: '14.28%', textAlign: 'center', py: 1 }}>
          <Typography variant="caption" sx={{ color: '#70757A', fontWeight: 500 }}>{dh}</Typography>
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
            <Typography variant="body2" sx={{ fontWeight: (isToday || blocked) ? 500 : 400 }}>{i}</Typography>
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: 350, mx: 'auto' }}>
        {cells}
      </Box>
    );
  };


  return (
    <Box sx={{ pb: 8, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Calendar Control
      </Typography>

      <Paper sx={{ mb: 4, borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#1A73E8' } }}
          sx={{ borderBottom: '1px solid #E0E0E0' }}
        >
          <Tab label="HOY" sx={{ textTransform: 'uppercase', fontWeight: 500, fontSize: '14px', '&.Mui-selected': { color: '#1A73E8' } }} />
          <Tab label="SEMANA" sx={{ textTransform: 'uppercase', fontWeight: 500, fontSize: '14px', '&.Mui-selected': { color: '#1A73E8' } }} />
          <Tab label="FECHAS BLOQUEADAS" sx={{ textTransform: 'uppercase', fontWeight: 500, fontSize: '14px', '&.Mui-selected': { color: '#1A73E8' } }} />
        </Tabs>

        {/* --- TAB 1: HOY --- */}
        {currentTab === 0 && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => handleDateChange(-1)} size="small" sx={{ border: '1px solid #70757A', width: 28, height: 28 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>keyboard_arrow_left</span>
                </IconButton>
                <Typography sx={{ fontWeight: 500, fontSize: '16px', color: '#202124', width: 140, textAlign: 'center' }}>
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
                  px: 2, py: 0.5, borderRadius: '16px', cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                  {currentDaySchedule.open ? 'Abierto' : 'Cerrado'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Button sx={{ p: 0, textTransform: 'none', color: '#1A73E8', fontWeight: 500 }} onClick={() => toggleAllInstant(true)}>
                Abrir todos
              </Button>
              <Button sx={{ p: 0, textTransform: 'none', color: '#D93025', fontWeight: 500 }} onClick={() => toggleAllInstant(false)}>
                Cerrar todos
              </Button>
            </Box>

            <Grid container spacing={2}>
              {Object.keys(currentDaySchedule.slots).sort().map(time => {
                const isOpen = currentDaySchedule.slots[time] && currentDaySchedule.open;
                const capacity = config.capacity[time] || 0;
                return (
                  <Grid item xs={3} key={time}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box 
                        onClick={() => { if(currentDaySchedule.open) toggleSlotInstant(time); }}
                        sx={{
                          width: 72, height: 48, borderRadius: '4px',
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          cursor: currentDaySchedule.open ? 'pointer' : 'not-allowed',
                          bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                          border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                          color: isOpen ? '#1A73E8' : '#BDBDBD',
                          userSelect: 'none',
                          mb: 0.5
                        }}
                      >
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>{time}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '11px', color: '#70757A', fontWeight: 400, pl: 0.5 }}>
                        {capacity} personas
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* --- TAB 2: SEMANA --- */}
        {currentTab === 1 && (
          <Box sx={{ p: 4, bgcolor: '#FAFAFA' }}>
            <Box sx={{ mb: 3 }}>
              <Button sx={{ textTransform: 'none', color: '#1A73E8', fontWeight: 500, p: 0 }} onClick={copyMondayToAll}>
                Copiar de Lunes a todos los días
              </Button>
            </Box>

            {DAYS.map(day => {
              const dayConfig = config.schedule[day];
              const openCount = Object.values(dayConfig.slots).filter(Boolean).length;
              return (
                <Accordion key={day} sx={{ mb: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<span className="material-icons">expand_more</span>}>
                    <Typography sx={{ fontWeight: 500, width: 120 }}>{DAY_LABELS[day]}</Typography>
                    <Typography sx={{ color: '#70757A', fontSize: '14px' }}>
                      {dayConfig.open ? `${openCount} slots abiertos` : 'Cerrado'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 3, borderTop: '1px solid #E0E0E0', mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Button sx={{ p: 0, textTransform: 'none', color: '#1A73E8', fontWeight: 500 }} onClick={() => toggleAllWeekly(day, true)}>
                          Abrir todos
                        </Button>
                        <Button sx={{ p: 0, textTransform: 'none', color: '#D93025', fontWeight: 500 }} onClick={() => toggleAllWeekly(day, false)}>
                          Cerrar todos
                        </Button>
                      </Box>
                      <Box 
                        onClick={() => toggleDayStatusWeekly(day)}
                        sx={{ 
                          bgcolor: dayConfig.open ? '#E8F0FE' : '#FDECEA',
                          color: dayConfig.open ? '#1A73E8' : '#D93025',
                          px: 2, py: 0.5, borderRadius: '16px', cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {dayConfig.open ? 'Abierto' : 'Cerrado'}
                        </Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      {Object.keys(dayConfig.slots).sort().map(time => {
                        const isOpen = dayConfig.slots[time] && dayConfig.open;
                        return (
                          <Grid item xs={3} key={time}>
                            <Box 
                              onClick={() => { if(dayConfig.open) toggleSlotWeekly(day, time); }}
                              sx={{
                                width: 72, height: 48, borderRadius: '4px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                cursor: dayConfig.open ? 'pointer' : 'not-allowed',
                                bgcolor: isOpen ? '#FFFFFF' : '#F1F3F4',
                                border: `1px solid ${isOpen ? '#1A73E8' : '#E0E0E0'}`,
                                color: isOpen ? '#1A73E8' : '#BDBDBD',
                                userSelect: 'none',
                              }}
                            >
                              <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>{time}</Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" fullWidth onClick={manualSave} disabled={saving} sx={{ height: 48, borderRadius: '4px', boxShadow: 'none' }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'GUARDAR PLANTILLA'}
              </Button>
            </Box>
          </Box>
        )}

        {/* --- TAB 3: FECHAS BLOQUEADAS --- */}
        {currentTab === 2 && (
          <Box sx={{ p: 4, bgcolor: '#FAFAFA' }}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => changeBlockMonth(-1)} size="small">
                  <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>keyboard_arrow_left</span>
                </IconButton>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', width: 140, textAlign: 'center' }}>
                  {MONTH_NAMES[blockMonthStart.getMonth()]} {blockMonthStart.getFullYear()}
                </Typography>
                <IconButton onClick={() => changeBlockMonth(1)} size="small">
                  <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>keyboard_arrow_right</span>
                </IconButton>
              </Box>

              {renderMonthGrid()}
            </Paper>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#70757A', mb: 2, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                Fechas Bloqueadas
              </Typography>
              
              {config.blockedDays.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#70757A' }}>No hay fechas bloqueadas</Typography>
              ) : (
                <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                  {config.blockedDays.map((dateStr, idx) => {
                    const d = new Date(dateStr);
                    const label = `${DAY_LABELS[dayNameMapping[d.getDay()]]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
                    return (
                      <Box key={dateStr} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: idx < config.blockedDays.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                        <Typography sx={{ color: '#202124', fontSize: '14px' }}>{label}</Typography>
                        <IconButton size="small" onClick={() => toggleBlockDate(new Date(dateStr))}>
                          <span className="material-icons" style={{ fontSize: 20, color: '#D93025' }}>close</span>
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" fullWidth onClick={manualSave} disabled={saving} sx={{ height: 48, borderRadius: '4px', boxShadow: 'none' }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'GUARDAR FECHAS'}
              </Button>
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
          sx: { bgcolor: '#323232', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px' }
        }}
      />
    </Box>
  );
}
