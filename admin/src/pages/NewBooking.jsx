import { useState, useEffect, useRef } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Select, MenuItem, FormControl, InputLabel,
  Popover, IconButton, Grid, InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

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

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function NewBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const adminCalendar = useSettingsStore(state => state.adminCalendar);
  const globalSettings = useSettingsStore(state => state.globalSettings);
  const storeLoading = useSettingsStore(state => state.loading);

  const todayStr = new Date().toISOString().split('T')[0];

  const [newBooking, setNewBooking] = useState({
    name: '', phone: '', date: todayStr, time: '', guests: 2, notes: ''
  });

  // DatePicker state
  const [anchorEl, setAnchorEl] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchGlobalHours();
  }, [fetchGlobalHours]);

  // Set default guests when loaded
  useEffect(() => {
    if (globalSettings?.minGuests && newBooking.guests < globalSettings.minGuests) {
      setNewBooking(prev => ({ ...prev, guests: globalSettings.minGuests }));
    }
  }, [globalSettings]);

  // --- Logic for Admin limits ---
  const isBlockedDay = adminCalendar?.blockedDays?.includes(newBooking.date);
  const dayName = newBooking.date ? DAYS_OF_WEEK[new Date(newBooking.date).getDay()] : null;
  const dayConfig = adminCalendar?.schedule?.[dayName];
  const isOpenDay = dayConfig?.open && !isBlockedDay;

  // Render shift blocks
  const availableShifts = [];
  if (isOpenDay && dayConfig?.shifts) {
    dayConfig.shifts.forEach((shift, idx) => {
       const oMins = toMinutes(shift.openingTime);
       let cMins = toMinutes(shift.closingTime);
       if (cMins <= oMins) cMins += 1440;
       const shiftSlots = [];
       for (let t = oMins; t <= cMins; t += shift.interval) {
          shiftSlots.push(toTimeString(t));
       }
       if (shiftSlots.length > 0) {
         availableShifts.push({ name: `Turno ${idx + 1}`, slots: shiftSlots });
       }
    });
  }

  const allAvailableSlots = availableShifts.flatMap(s => s.slots);
  
  // Reset time if selected time is no longer valid for the newly selected date
  useEffect(() => {
    if (newBooking.time && !allAvailableSlots.includes(newBooking.time)) {
      setNewBooking(prev => ({ ...prev, time: '' }));
    }
  }, [newBooking.date, allAvailableSlots]);

  // Validation
  const guestsNum = Number(newBooking.guests);
  const isGuestsInvalid = guestsNum < globalSettings.minGuests || guestsNum > globalSettings.maxGuests;
  const isDateInvalid = !newBooking.date || isBlockedDay;
  const isNameInvalid = !newBooking.name.trim();
  const isTimeInvalid = !newBooking.time || !allAvailableSlots.includes(newBooking.time);

  const isFormValid = !isGuestsInvalid && !isDateInvalid && !isTimeInvalid && !isNameInvalid;

  const handleAddBooking = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date: newBooking.date,
          slot: { time: newBooking.time },
          guests: newBooking.guests,
          user: {
            name: newBooking.name,
            phone: newBooking.phone,
            email: '',
            specialRequests: newBooking.notes
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          throw new Error(data.errors[firstErrorKey][0]);
        }
        throw new Error(data.message || 'Failed to book');
      }

      navigate('/reservations');
    } catch (e) {
      setErrorMsg(e.message || 'Error saving booking');
    } finally {
      setLoading(false);
    }
  };

  // --- Calendar Popup Generators ---
  const handleOpenDatePicker = (event) => setAnchorEl(event.currentTarget);
  const handleCloseDatePicker = () => setAnchorEl(null);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11); setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0); setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const blanks = Array.from({ length: firstDay });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Normalize today for comparison
    const todayTarget = new Date();
    todayTarget.setHours(0,0,0,0);

    return (
      <Grid container spacing={0.5} sx={{ p: '16px', width: 280 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <Grid item xs={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontWeight: 500 }}>{d}</Typography>
          </Grid>
        ))}
        {blanks.map((_, i) => <Grid item xs={12/7} key={`blank-${i}`} />)}
        {days.map(d => {
          const dateObj = new Date(calendarYear, calendarMonth, d);
          dateObj.setHours(0,0,0,0);
          
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dayStr = String(dateObj.getDate()).padStart(2, '0');
          const fDate = `${y}-${m}-${dayStr}`;
          
          const isPast = dateObj < todayTarget;
          const isBlocked = adminCalendar?.blockedDays?.includes(fDate);
          const isSelected = newBooking.date === fDate;
          
          let color = '#202124';
          let bgcolor = 'transparent';
          let disabled = false;
          let fontWeight = 400;

          if (isPast) {
            color = '#BDBDBD';
            disabled = true;
          } else if (isBlocked) {
            color = '#D93025';
            disabled = true;
          } else {
            if (isSelected) {
              bgcolor = '#1A73E8';
              color = '#FFFFFF';
              fontWeight = 500;
            } else {
              if (fDate === todayStr) {
                color = '#1A73E8';
                fontWeight = 500;
              }
            }
          }

          return (
            <Grid item xs={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
              <Button 
                disabled={disabled}
                onClick={() => {
                  setNewBooking(prev => ({ ...prev, date: fDate }));
                  handleCloseDatePicker();
                }}
                sx={{ 
                  minWidth: 0, width: 32, height: 32, borderRadius: '50%', p: 0,
                  color, bgcolor, fontWeight, fontFamily: 'Roboto', fontSize: '13px',
                  '&:hover': { bgcolor: isSelected ? '#1557B0' : disabled ? 'transparent' : '#F1F3F4' },
                  '&.Mui-disabled': { color }
                }}
              >
                {d}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Box>
        <Button 
          startIcon={<span className="material-icons">arrow_back</span>} 
          onClick={() => navigate('/reservations')} 
          sx={{ color: '#70757A', textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', letterSpacing: '1.25px' }}
        >
          Back to Reservations
        </Button>
      </Box>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124', mb: '8px' }}>
          New Manual Booking
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mb: '24px' }}>
          Enter the customer details to block off a table.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: '24px', borderRadius: '4px' }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Box>
            <TextField 
              fullWidth label="Customer Name" required
              value={newBooking.name} onChange={e => setNewBooking({...newBooking, name: e.target.value})}
              InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
              InputProps={{ sx: { minHeight: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
            />
            {(!newBooking.name.trim() && newBooking.name !== '') && (
               <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>
                 El nombre es requerido
               </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* Custom Date Picker Trigger */}
            <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
              <Button
                onClick={handleOpenDatePicker}
                sx={{ 
                  height: 56, borderRadius: '4px', border: '1px solid #DADCE0', justifyContent: 'flex-start', px: '14px',
                  color: '#202124', fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', textTransform: 'none',
                  '&:hover': { border: '1px solid #202124', bgcolor: 'transparent' }
                }}
              >
                {newBooking.date ? newBooking.date : 'Seleccione una fecha'}
              </Button>
              <Popover
                open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleCloseDatePicker}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{ sx: { mt: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px' } }}
              >
                <Box sx={{ p: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0' }}>
                  <IconButton onClick={handlePrevMonth} size="small"><span className="material-icons" style={{fontSize: 20}}>chevron_left</span></IconButton>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                    {MONTHS[calendarMonth]} {calendarYear}
                  </Typography>
                  <IconButton onClick={handleNextMonth} size="small"><span className="material-icons" style={{fontSize: 20}}>chevron_right</span></IconButton>
                </Box>
                {renderCalendarDays()}
              </Popover>
              {isBlockedDay && (
                 <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>
                   Esta fecha está cerrada (bloqueada).
                 </Typography>
              )}
            </Box>

            {/* Custom Time Select */}
            <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
              <FormControl fullWidth>
                <Select
                  displayEmpty
                  value={newBooking.time}
                  onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                  disabled={isBlockedDay || allAvailableSlots.length === 0}
                  IconComponent={(props) => <span {...props} className={"material-icons " + props.className} style={{ color: '#70757A' }}>arrow_drop_down</span>}
                  sx={{ 
                    height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0' }
                  }}
                  renderValue={(val) => {
                    if (!val) return <span style={{color: '#70757A'}}>Time</span>;
                    return val;
                  }}
                >
                  {availableShifts.map((shiftGroup, gIdx) => [
                    <MenuItem disabled key={`header-${gIdx}`} sx={{ opacity: '1 !important', py: '10px' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ── {shiftGroup.name} ──
                      </Typography>
                    </MenuItem>,
                    ...shiftGroup.slots.map(t => (
                      <MenuItem key={t} value={t} sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124', pl: '24px' }}>
                        {t}
                      </MenuItem>
                    ))
                  ])}
                </Select>
              </FormControl>
              {isBlockedDay && (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#D93025', mt: '4px' }}>
                  Este día está cerrado
                </Typography>
              )}
              {!isBlockedDay && allAvailableSlots.length === 0 && newBooking.date && (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A', mt: '4px' }}>
                  No hay horarios disponibles para este día
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
              <TextField 
                label="Guests" type="number" required
                value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: e.target.value})}
                InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                InputProps={{ sx: { minHeight: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
              />
              {isGuestsInvalid && (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>
                  El número de personas debe estar entre {globalSettings.minGuests} y {globalSettings.maxGuests}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
               <TextField 
                 label="Phone (WhatsApp)" 
                 value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
                 InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                 InputProps={{ sx: { minHeight: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
               />
            </Box>
          </Box>
          
          <TextField 
            fullWidth label="Notes / Special Requests" multiline rows={3}
            value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
            InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
            InputProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px' } }}
          />

          <Box sx={{ mt: '8px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button 
              onClick={() => navigate('/reservations')} 
              disabled={loading}
              sx={{ color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddBooking} 
              disabled={loading || !isFormValid}
              sx={{ 
                height: 44, px: '24px', bgcolor: '#1A73E8', boxShadow: 'none', borderRadius: '4px',
                fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px',
                '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#BDBDBD' }
              }}
            >
              {loading ? 'Saving...' : 'Save Booking'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
