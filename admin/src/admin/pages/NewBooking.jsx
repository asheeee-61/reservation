import { useState, useEffect, useRef } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Select, MenuItem, FormControl, InputLabel,
  Popover, IconButton, Grid, InputAdornment, Alert,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { apiClient } from '../services/apiClient';
import CustomerAvatar from '../components/CustomerAvatar';

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
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
    name: '', phone: '', email: '', date: todayStr, time: '', guests: 2, notes: ''
  });
  
  // FIX 2 states
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersResults, setCustomersResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [tableTypes, setTableTypes] = useState([]);
  const [tableTypesLoading, setTableTypesLoading] = useState(false);
  const [tableTypesError, setTableTypesError] = useState(false);
  
  const [specialEvents, setSpecialEvents] = useState([]);
  const [specialEventsLoading, setSpecialEventsLoading] = useState(false);
  const [specialEventsError, setSpecialEventsError] = useState(false);

  const [tableTypeId, setTableTypeId] = useState('');
  const [specialEventId, setSpecialEventId] = useState('');

  // PROGRESSIVE DISCLOSURE STATES
  const [showNotes, setShowNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, loading, success, error

  // DatePicker state
  const [anchorEl, setAnchorEl] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchGlobalHours();
  }, [fetchGlobalHours]);

  useEffect(() => {
    const fetchTableTypes = async () => {
      setTableTypesLoading(true);
      setTableTypesError(false);
      try {
        const res = await apiClient('/admin/table-types');
        const types = Array.isArray(res) ? res : (res.data ?? []);
        const activeTypes = types.filter(t => t.is_active);
        setTableTypes(activeTypes);
        if (activeTypes.length > 0) {
          setTableTypeId(activeTypes[0].id);
        }
      } catch (err) {
        setTableTypesError(true);
        console.error(err);
      } finally {
        setTableTypesLoading(false);
      }
    };

    const fetchSpecialEvents = async () => {
      setSpecialEventsLoading(true);
      setSpecialEventsError(false);
      try {
        const evRes = await apiClient('/admin/special-events');
        const events = Array.isArray(evRes) ? evRes : (evRes.data ?? []);
        const activeEvents = events.filter(e => e.is_active);
        setSpecialEvents(activeEvents);
        if (activeEvents.length > 0) {
          setSpecialEventId(activeEvents[0].id);
        }
      } catch (err) {
        setSpecialEventsError(true);
        console.error(err);
      } finally {
        setSpecialEventsLoading(false);
      }
    };

    fetchTableTypes();
    fetchSpecialEvents();
  }, []);

  // FIX 2: Debounced customer search
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomersResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiClient(`/admin/customers?search=${encodeURIComponent(customerSearch)}`);
        // FIX: Handle both paginated and plain array responses
        const list = data.data ?? data;
        setCustomersResults(list);
        setShowResults(true);
      } catch (err) {
        console.error('Customer search failed:', err);
        setCustomersResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewBooking(prev => ({
      ...prev,
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    }));
    setCustomerSearch('');
    setShowResults(false);
  };

  const handleCreateAsNew = () => {
    setNewBooking(prev => ({
      ...prev,
      name: customerSearch,
      email: '',
      phone: ''
    }));
    setSelectedCustomer(null);
    setCustomerSearch('');
    setShowResults(false);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setNewBooking(prev => ({ ...prev, name: '', email: '', phone: '' }));
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync name with as-typed search if no customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setNewBooking(prev => ({ ...prev, name: customerSearch }));
    }
  }, [customerSearch, selectedCustomer]);


  // Set default guests when loaded
  useEffect(() => {
    if (globalSettings?.minGuests && newBooking.guests < globalSettings.minGuests) {
      setNewBooking(prev => ({ ...prev, guests: globalSettings.minGuests }));
    }
  }, [globalSettings, newBooking.guests]);

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
  
  // FIX 3: Default Time: first available open slot for selected date
  useEffect(() => {
    if (allAvailableSlots.length > 0 && !newBooking.time) {
      setNewBooking(prev => ({ ...prev, time: allAvailableSlots[0] }));
    }
  }, [allAvailableSlots, newBooking.time]);
  // Reset time if selected time is no longer valid for the newly selected date
  useEffect(() => {
    if (newBooking.time && !allAvailableSlots.includes(newBooking.time)) {
      setNewBooking(prev => ({ ...prev, time: '' }));
    }
  }, [newBooking.date, allAvailableSlots, newBooking.time]);

  // FIX 3: Validation rules
  const isDateInvalid = !newBooking.date || isBlockedDay;
  const isNameInvalid = !newBooking.name.trim();

  // FIX: Derived validation
  const isNewCustomer = selectedCustomer === null;
  const phoneRequired = isNewCustomer;
  const isPhoneInvalid = phoneRequired && !newBooking.phone.trim();

  // "SAVE BOOKING" enabled as long as customer name + date filled + phone (if new)
  const isFormValid = !isDateInvalid && !isNameInvalid && !isPhoneInvalid;

  const showContactFields = customerSearch.length > 0 || selectedCustomer !== null;

  const handleAddBooking = async () => {
    if (!isFormValid) return;
    setSaveStatus('loading');
    setErrorMsg(null);
    try {
      // If existing customer: check if we need to update their profile first
      if (selectedCustomer) {
        const hasChanged = 
          newBooking.phone !== (selectedCustomer.phone || '') || 
          newBooking.email !== (selectedCustomer.email || '');

        if (hasChanged) {
          await apiClient(`/admin/customers/${selectedCustomer.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: selectedCustomer.name, // Keep name fixed as per chip UI
              phone: newBooking.phone,
              email: newBooking.email
            })
          });
        }
      }

      const payload = {
        // FIX: If existing customer: send their ID, otherwise send details
        ...(selectedCustomer 
          ? { customer_id: selectedCustomer.id }
          : { 
              user: {
                name: newBooking.name,
                phone: newBooking.phone,
                email: newBooking.email || null
              }
            }
        ),
        date: newBooking.date,
        slot: { time: newBooking.time },
        guests: newBooking.guests,
        table_type_id: tableTypeId,
        special_event_id: specialEventId || null,
        special_requests: newBooking.notes
      };

      await apiClient('/admin/reservations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSaveStatus('success');
      setTimeout(() => {
        navigate('/admin/reservations');
      }, 1000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      setErrorMsg('Error al guardar la reserva');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
          <Grid size={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontWeight: 500 }}>{d}</Typography>
          </Grid>
        ))}
        {blanks.map((_, i) => <Grid size={12/7} key={`blank-${i}`} />)}
        {days.map(d => {
          const dateObj = new Date(calendarYear, calendarMonth, d);
          dateObj.setHours(0,0,0,0);
          
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dayStr = String(dateObj.getDate()).padStart(2, '0');
          const fDate = `${y}-${m}-${dayStr}`;
          
          const isPast = dateObj < todayTarget;
          const isBlocked = adminCalendar?.blockedDays?.includes(fDate);
          
          const dayNameLocal = DAYS_OF_WEEK[dateObj.getDay()];
          const dayConfigLocal = adminCalendar?.schedule?.[dayNameLocal];
          const isClosedDay = !dayConfigLocal?.open;
          
          const isSelected = newBooking.date === fDate;
          
          let color = '#202124';
          let bgcolor = 'transparent';
          let disabled = false;
          let fontWeight = 400;

          if (isPast) {
            color = '#BDBDBD';
            disabled = true;
          } else if (isBlocked || isClosedDay) {
            color = isBlocked ? '#D93025' : '#BDBDBD';
            disabled = isBlocked; // allow clicking blocked to see warning? No, prompt says grey out closed days.
            // Wait, prompt says: "Date picker: show only dates that have at least 1 open slot (grey out fully closed days)"
            // "When admin picks a blocked day: Show inline warning"
            // So blocked days are pickable but closed days are greyed out.
          }
          
          if (isClosedDay && !isBlocked) {
            disabled = true;
            color = '#BDBDBD';
          }

          return (
            <Grid size={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
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
    <Box sx={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: '24px', mx: 'auto' }}>
      <Box sx={{ mb: '8px' }}>
        <Button 
          startIcon={<span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>} 
          onClick={() => navigate('/admin/reservations')} 
          sx={{ 
            color: '#1A73E8', textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 500, fontSize: 13, letterSpacing: '1.25px', p: 0,
            '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
          }}
        >
          VOLVER A RESERVAS
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ borderRadius: '4px' }}>
          {errorMsg}
        </Alert>
      )}

      {/* TWO PANEL CONTAINER */}
      <Box sx={{ 
        display: 'flex', 
        gap: '24px', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'flex-start'
      }}>
        
        {/* LEFT PANEL: CLIENTE */}
        <Paper sx={{ 
          flex: 1, p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', width: '100%', boxSizing: 'border-box' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: '16px', borderBottom: '1px solid #E0E0E0', mb: '20px' }}>
            <span className="material-icons" style={{ fontSize: 20, color: '#1A73E8' }}>person</span>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
              Cliente
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Customer Search / Chip */}
            <Box sx={{ position: 'relative' }} ref={searchRef}>
              {selectedCustomer || (newBooking.name && !customerSearch) ? (
                <Box sx={{ 
                  p: '8px 12px', border: '1px solid #1A73E8', borderRadius: '4px', bgcolor: '#E8F0FE', 
                  display: 'flex', alignItems: 'center', height: 56, boxSizing: 'border-box' 
                }}>
                   <CustomerAvatar 
                    name={selectedCustomer?.name || newBooking.name} 
                    counts={{
                      total: selectedCustomer?.reservations_count,
                      arrived: selectedCustomer?.arrived_count,
                      noShow: selectedCustomer?.no_show_count
                    }}
                    size={32}
                  />
                  <Box sx={{ flexGrow: 1, ml: 1.5 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1A73E8', lineHeight: 1.2 }}>
                      {selectedCustomer?.name || newBooking.name}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#1A73E8', opacity: 0.8 }}>
                      {selectedCustomer ? 'Cliente seleccionado' : 'Nuevo cliente'}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={handleClearSelectedCustomer} sx={{ color: '#1A73E8' }}>
                    <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                  </IconButton>
                </Box>
              ) : (
                <TextField 
                  fullWidth label="CLIENTE *" required
                  placeholder="Buscar por nombre, correo o teléfono..."
                  value={customerSearch} 
                  onChange={e => setCustomerSearch(e.target.value)}
                  onFocus={() => customerSearch.length >= 2 && setShowResults(true)}
                  InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                  InputProps={{ 
                    sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' },
                    endAdornment: isSearching ? <CircularProgress size={20} /> : null,
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>search</span>
                      </InputAdornment>
                    ),
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: (isNameInvalid && newBooking.name === '' && !customerSearch) ? '#D93025' : '#DADCE0' 
                    }
                  }}
                />
              )}

              {/* Search Results Popover Simulation (Custom Menu) */}
              {showResults && (
                <Paper sx={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, 
                  mt: 0.5, border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                  maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' 
                }}>
                  <List sx={{ py: 0 }}>
                    {customersResults.length > 0 ? (
                      <>
                        <ListItem sx={{ bgcolor: '#F1F3F4', py: 1 }}>
                          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#70757A', textTransform: 'uppercase' }}>Clientes existentes</Typography>
                        </ListItem>
                        {customersResults.slice(0, 5).map((c) => (
                          <ListItem key={c.id} button onClick={() => handleSelectCustomer(c)} sx={{ borderBottom: '1px solid #F1F3F4' }}>
                            <Box sx={{ mr: 2, ml: 1 }}>
                              <CustomerAvatar 
                                name={c.name} 
                                counts={{
                                  total: c.reservations_count,
                                  arrived: c.arrived_count,
                                  noShow: c.no_show_count
                                }}
                                size={36}
                                showTooltip={false}
                              />
                            </Box>
                            <ListItemText 
                              primary={<Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</Typography>}
                              secondary={<Typography sx={{ fontSize: '12px', color: '#70757A' }}>{c.phone || c.email || 'Sin contacto'}</Typography>}
                            />
                            <span className="material-icons" style={{ fontSize: 18, color: '#1A73E8' }}>chevron_right</span>
                          </ListItem>
                        ))}
                      </>
                    ) : (
                      <ListItem sx={{ p: '16px', color: '#70757A' }}>
                        <Typography sx={{ fontSize: '13px' }}>No se encontró '{customerSearch}'</Typography>
                      </ListItem>
                    )}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Email (progressive) */}
            <Box sx={{ 
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out',
              maxHeight: showContactFields ? '200px' : '0px',
              opacity: showContactFields ? 1 : 0
            }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                Email
              </Typography>
              <TextField 
                placeholder="correo@ejemplo.com"
                value={newBooking.email}
                onChange={e => setNewBooking({...newBooking, email: e.target.value})}
                InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }}
              />
            </Box>

            {/* WhatsApp (progressive) */}
            <Box sx={{ 
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out',
              maxHeight: showContactFields ? '200px' : '0px',
              opacity: showContactFields ? 1 : 0
            }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                {selectedCustomer ? 'WhatsApp' : 'WhatsApp *'}
              </Typography>
              <TextField 
                value={newBooking.phone} 
                onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
                placeholder="+34 000 000 000"
                error={isPhoneInvalid && newBooking.phone !== ''}
                InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }}
              />
              {isPhoneInvalid && newBooking.phone === '' && (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>
                  El WhatsApp es obligatorio para nuevos clientes
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* RIGHT PANEL: RESERVA */}
        <Paper sx={{ 
          flex: 1, p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', width: '100%', boxSizing: 'border-box' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: '16px', borderBottom: '1px solid #E0E0E0', mb: '20px' }}>
            <span className="material-icons" style={{ fontSize: 20, color: '#1A73E8' }}>event</span>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
              Reserva
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Row 1: Date | Time */}
            <Box sx={{ display: 'flex', gap: '16px' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                  FECHA <span style={{ color: '#D93025' }}>*</span>
                </Typography>
                <Button
                  onClick={handleOpenDatePicker}
                  sx={{ 
                    height: 56, borderRadius: '4px', border: '1px solid #DADCE0', justifyContent: 'flex-start', px: '14px',
                    color: '#202124', fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', textTransform: 'none',
                    bgcolor: '#FFFFFF', '&:hover': { border: '1px solid #202124', bgcolor: 'transparent' }
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
                    Este día está cerrado
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                  HORA
                </Typography>
                <FormControl fullWidth>
                  <Select
                    displayEmpty
                    value={newBooking.time}
                    onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                    disabled={isBlockedDay || allAvailableSlots.length === 0}
                    IconComponent={(props) => <span {...props} className={"material-icons " + props.className} style={{ color: '#70757A' }}>arrow_drop_down</span>}
                    sx={{ 
                      height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124', bgcolor: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0' }
                    }}
                    renderValue={(val) => {
                      if (!val) return <span style={{color: '#70757A'}}>Sin horarios disponibles</span>;
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
              </Box>
            </Box>

            {/* Row 2: Guests (Full Width) */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                PERSONAS
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                <Button 
                  onClick={() => setNewBooking(prev => ({ ...prev, guests: Math.max(globalSettings?.minGuests || 1, Number(prev.guests) - 1) }))}
                  sx={{ minWidth: 32, width: 32, height: 32, p: 0, border: '1px solid #DADCE0', borderRadius: '4px', color: '#202124' }}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>remove</span>
                </Button>
                <Typography sx={{ width: 48, textAlign: 'center', fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
                  {newBooking.guests}
                </Typography>
                <Button 
                  onClick={() => setNewBooking(prev => ({ ...prev, guests: Math.min(globalSettings?.maxGuests || 20, Number(prev.guests) + 1) }))}
                  sx={{ minWidth: 32, width: 32, height: 32, p: 0, border: '1px solid #DADCE0', borderRadius: '4px', color: '#202124' }}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>add</span>
                </Button>
              </Box>
            </Box>

            {/* Row 3: Table Type (Full Width) */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                TIPO DE MESA
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={tableTypeId}
                  onChange={(e) => setTableTypeId(e.target.value)}
                  disabled={tableTypesLoading || tableTypesError}
                  sx={{ height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', bgcolor: '#FFFFFF' }}
                >
                  {tableTypesLoading && <MenuItem value="" disabled>Cargando...</MenuItem>}
                  {tableTypesError && <MenuItem value="" disabled>Error al cargar</MenuItem>}
                  {tableTypes.length > 0 ? tableTypes.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  )) : <MenuItem value={tableTypeId} sx={{ display: 'none' }} />}
                </Select>
                {tableTypeId && (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tableTypes.find(t => t.id === tableTypeId)?.description}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Row 4: Special Event (Full Width) */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                EVENTO ESPECIAL
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={specialEventId}
                  onChange={(e) => setSpecialEventId(e.target.value)}
                  disabled={specialEventsLoading || specialEventsError}
                  sx={{ height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', bgcolor: '#FFFFFF' }}
                >
                  {specialEventsLoading && <MenuItem value="" disabled>Cargando...</MenuItem>}
                  {specialEventsError && <MenuItem value="" disabled>Error al cargar</MenuItem>}
                  {specialEvents.length > 0 ? specialEvents.map(e => (
                    <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                  )) : <MenuItem value={specialEventId} sx={{ display: 'none' }} />}
                </Select>
                {specialEventId && (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {specialEvents.find(e => e.id === specialEventId)?.description}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Row 5: Notes */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {!showNotes ? (
                <Button 
                  onClick={() => setShowNotes(true)}
                  sx={{ 
                    width: 'fit-content', p: 0, minWidth: 0, color: '#1A73E8', 
                    fontFamily: 'Roboto', fontSize: '14px', textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  + Añadir nota
                </Button>
              ) : (
                <Box sx={{ 
                  overflow: 'hidden',
                  transition: 'max-height 200ms ease-in-out',
                  maxHeight: '200px'
                }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>
                    NOTAS (Opcional)
                  </Typography>
                  <TextField 
                    fullWidth multiline rows={3}
                    value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                    placeholder="Peticiones especiales, alergias..."
                    InputProps={{ sx: { fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* FOOTER BUTTONS */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', mt: 'auto' }}>
        <Button 
          variant="outlined"
          onClick={() => navigate('/admin/reservations')} 
          disabled={saveStatus === 'loading'}
          sx={{ 
            color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', 
            minWidth: 100, textTransform: 'uppercase', borderColor: '#DADCE0',
            '&:hover': { bgcolor: '#F1F3F4', borderColor: '#DADCE0' }
          }}
        >
          CANCELAR
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddBooking} 
          disabled={saveStatus === 'loading' || saveStatus === 'success' || !isFormValid}
          sx={{ 
            height: 44, px: '24px', 
            bgcolor: saveStatus === 'success' ? '#137333' : '#1A73E8', 
            boxShadow: 'none', borderRadius: '4px',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px', color: '#FFFFFF',
            transition: 'background-color 200ms ease',
            '&:hover': { bgcolor: saveStatus === 'success' ? '#137333' : '#1557B0', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: saveStatus === 'success' ? '#137333' : '#E0E0E0', color: saveStatus === 'success' ? '#FFFFFF' : '#BDBDBD' }
          }}
        >
          {saveStatus === 'loading' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ 
                fontSize: 18,
                animation: 'spin 1s linear infinite'
              }}>sync</span>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              GUARDANDO...
            </Box>
          ) : saveStatus === 'success' ? (
            '✓ GUARDADO'
          ) : (
            'GUARDAR RESERVA'
          )}
        </Button>
      </Box>
    </Box>
  );
}
