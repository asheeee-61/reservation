import { useState, useEffect, useRef } from 'react';
import { 
  Typography, Box, Paper, TextField, 
  Button, Select, MenuItem, FormControl, InputLabel,
  Popover, IconButton, Grid, InputAdornment, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress
} from '@mui/material';
import { useSettingsStore } from '../store/useSettingsStore';
import { apiClient } from '../../shared/api';
import CustomerAvatar from './CustomerAvatar';
import { BackButton } from './BackButton';
import { useToast } from './Toast/ToastContext';

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

const STATUS_LABELS = {
  'PENDIENTE': 'Pendiente',
  'CONFIRMADA': 'Confirmada',
  'ASISTIÓ': 'Asistió',
  'NO_ASISTIÓ': 'No asistió',
  'CANCELADA': 'Cancelada'
};

export default function ReservationForm({ initialData, compact = false, onSuccess, onCancel }) {
  const isEditing = !!initialData?.id;
  const todayStr = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const adminCalendar = useSettingsStore(state => state.adminCalendar);
  const globalSettings = useSettingsStore(state => state.globalSettings);

  const [formState, setFormState] = useState({
    name: initialData?.customer?.name || initialData?.name || '', 
    phone: initialData?.customer?.phone || initialData?.phone || '', 
    email: initialData?.customer?.email || initialData?.email || '', 
    date: initialData?.date || todayStr, 
    time: initialData?.time || '', 
    guests: initialData?.guests || 2, 
    notes: initialData?.special_requests || '',
    status: initialData?.status?.toUpperCase() || 'PENDIENTE'
  });
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersResults, setCustomersResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(initialData?.customer || null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(false);

  const [zoneId, setZoneId] = useState(initialData?.zone_id || initialData?.zone_id || '');
  const [eventId, setEventId] = useState(initialData?.event_id || '');

  const [showNotes, setShowNotes] = useState(!!formState.notes);
  const [saveStatus, setSaveStatus] = useState('idle');

  const [anchorEl, setAnchorEl] = useState(null);
  const initialDateObj = initialData?.date ? new Date(initialData.date) : new Date();
  const [calendarMonth, setCalendarMonth] = useState(initialDateObj.getMonth());
  const [calendarYear, setCalendarYear] = useState(initialDateObj.getFullYear());

  useEffect(() => { fetchGlobalHours(); }, [fetchGlobalHours]);

  useEffect(() => {
    const fetchFormMetadata = async () => {
      setZonesLoading(true);
      setEventsLoading(true);
      setZonesError(false);
      setEventsError(false);

      try {
        const [typesRes, eventsRes] = await Promise.all([
          apiClient('/admin/zones'),
          apiClient('/admin/events')
        ]);

        // Process Table Types
        const types = Array.isArray(typesRes) ? typesRes : (typesRes.data ?? []);
        const activeTypes = types.filter(t => t.is_active || t.id === (initialData?.zone_id || initialData?.zone_id));
        setZones(activeTypes);
        if (!zoneId && activeTypes.length > 0) {
          setZoneId(activeTypes[0].id);
        }

        // Process Special Events
        const events = Array.isArray(eventsRes) ? eventsRes : (eventsRes.data ?? []);
        const activeEvents = events.filter(e => e.is_active || e.id === initialData?.event_id);
        setEvents(activeEvents);

      } catch (err) {
        setZonesError(true);
        setEventsError(true);
        console.error('Error fetching form metadata:', err);
      } finally {
        setZonesLoading(false);
        setEventsLoading(false);
      }
    };

    fetchFormMetadata();
  }, [initialData?.zone_id, initialData?.event_id]);

  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomersResults([]); setShowResults(false); return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiClient(`/admin/customers?search=${encodeURIComponent(customerSearch)}`);
        setCustomersResults(data.data ?? data);
        setShowResults(true);
      } catch (err) {
        setCustomersResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormState(prev => ({
      ...prev, name: customer.name || '', email: customer.email || '', phone: customer.phone || ''
    }));
    setCustomerSearch(''); setShowResults(false);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setFormState(prev => ({ ...prev, name: '', email: '', phone: '' }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      setFormState(prev => ({ ...prev, name: customerSearch }));
    }
  }, [customerSearch, selectedCustomer]);


  const isBlockedDay = adminCalendar?.blockedDays?.includes(formState.date);
  const dayName = formState.date ? DAYS_OF_WEEK[new Date(formState.date).getDay()] : null;
  const dayConfig = adminCalendar?.schedule?.[dayName];
  const isOpenDay = dayConfig?.open && !isBlockedDay;

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
  
  useEffect(() => {
    if (allAvailableSlots.length > 0 && !formState.time && !initialData?.time) {
      setFormState(prev => ({ ...prev, time: allAvailableSlots[0] }));
    }
  }, [allAvailableSlots, formState.time, initialData?.time]);

  useEffect(() => {
    if (formState.time && !allAvailableSlots.includes(formState.time) && (!initialData || formState.date !== initialData.date)) {
      setFormState(prev => ({ ...prev, time: '' }));
    }
  }, [formState.date, allAvailableSlots, formState.time, initialData]);

  const isDateInvalid = !formState.date || isBlockedDay;
  const isNameInvalid = !formState.name.trim();
  const isNewCustomer = selectedCustomer === null;
  const phoneRequired = isNewCustomer;
  const isPhoneInvalid = phoneRequired && !formState.phone.trim();
  const isFormValid = !isDateInvalid && !isNameInvalid && !isPhoneInvalid && !!formState.time && !!zoneId;

  const showContactFields = customerSearch.length > 0 || selectedCustomer !== null || isEditing;

  const handleSaveBooking = async () => {
    if (!isFormValid) return;
    setSaveStatus('loading');
    try {
      if (selectedCustomer) {
        const hasChanged = formState.phone !== (selectedCustomer.phone || '') || formState.email !== (selectedCustomer.email || '');
        if (hasChanged) {
          await apiClient(`/admin/customers/${selectedCustomer.id}`, {
            method: 'PUT', body: JSON.stringify({ name: selectedCustomer.name, phone: formState.phone, email: formState.email })
          });
        }
      }

      if (isEditing) {
        await apiClient(`/admin/reservations/${initialData.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formState.name, phone: formState.phone, email: formState.email,
            date: formState.date, time: formState.time, guests: formState.guests,
            status: formState.status, zone_id: zoneId, event_id: eventId || null,
            special_requests: formState.notes
          })
        });
      } else {
        const payload = {
          ...(selectedCustomer ? { customer_id: selectedCustomer.id } : { user: { name: formState.name, phone: formState.phone, email: formState.email || null } }),
          date: formState.date, slot: { time: formState.time }, guests: formState.guests,
          zone_id: zoneId, event_id: eventId || null, special_requests: formState.notes
        };
        await apiClient('/admin/reservations', { method: 'POST', body: JSON.stringify(payload) });
      }

      setSaveStatus('success');
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      toast.error('Error al guardar la reserva');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const blanks = Array.from({ length: firstDay });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const todayTarget = new Date(); todayTarget.setHours(0,0,0,0);

    return (
      <Grid container spacing={0.5} sx={{ p: '16px', width: 280 }}>
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
          <Grid size={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontWeight: 500 }}>{d}</Typography>
          </Grid>
        ))}
        {blanks.map((_, i) => <Grid size={12/7} key={`blank-${i}`} />)}
        {days.map(d => {
          const dateObj = new Date(calendarYear, calendarMonth, d); dateObj.setHours(0,0,0,0);
          const y = dateObj.getFullYear(); const m = String(dateObj.getMonth() + 1).padStart(2, '0'); const dayStr = String(dateObj.getDate()).padStart(2, '0');
          const fDate = `${y}-${m}-${dayStr}`;
          
          const isPast = dateObj < todayTarget;
          const isBlocked = adminCalendar?.blockedDays?.includes(fDate);
          const isClosedDay = !adminCalendar?.schedule?.[DAYS_OF_WEEK[dateObj.getDay()]]?.open;
          const isSelected = formState.date === fDate;
          
          let color = '#202124', bgcolor = 'transparent', disabled = false, fontWeight = 400;

          if (isPast) { color = '#BDBDBD'; disabled = true; }
          else if (isBlocked || isClosedDay) {
            color = isBlocked ? '#D93025' : '#BDBDBD';
            disabled = isBlocked || isClosedDay; 
          }
          
          return (
            <Grid size={12/7} key={d} sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
              <Button 
                disabled={disabled}
                onClick={() => { setFormState(prev => ({ ...prev, date: fDate })); setAnchorEl(null); }}
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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!compact && (
        <Box sx={{ mb: '8px' }}>
          <BackButton fallback="/admin/reservations" />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: '24px', flexDirection: compact ? 'column' : { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
        
        {/* LEFT PANEL: CLIENTE */}
        <Paper sx={{ flex: 1, p: '24px', borderRadius: '4px', border: compact ? 'none' : '1px solid #E0E0E0', boxShadow: 'none', width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '16px', borderBottom: '1px solid #E0E0E0', mb: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: 20, color: '#1A73E8' }}>person</span>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>Cliente</Typography>
            </Box>
            {isEditing && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={formState.status}
                  onChange={e => setFormState({...formState, status: e.target.value})}
                  sx={{ height: 32, fontFamily: 'Roboto', fontSize: '13px' }}
                >
                  {Object.keys(STATUS_LABELS).map(st => <MenuItem key={st} value={st} sx={{ fontFamily: 'Roboto', fontSize: '13px' }}>{STATUS_LABELS[st]}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box sx={{ position: 'relative' }} ref={searchRef}>
              {selectedCustomer || (formState.name && !customerSearch) ? (
                <Box sx={{ p: '8px 12px', border: '1px solid #1A73E8', borderRadius: '4px', bgcolor: '#E8F0FE', display: 'flex', alignItems: 'center', height: 56, boxSizing: 'border-box' }}>
                  <CustomerAvatar 
                    name={selectedCustomer?.name || formState.name} 
                    counts={{
                      total: selectedCustomer?.reservations_count,
                      arrived: selectedCustomer?.arrived_count,
                      noShow: selectedCustomer?.no_show_count
                    }}
                    size={32}
                  />
                  <Box sx={{ flexGrow: 1, ml: 1.5 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1A73E8', lineHeight: 1.2 }}>{selectedCustomer?.name || formState.name}</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#1A73E8', opacity: 0.8 }}>{selectedCustomer ? 'Cliente seleccionado' : 'Nuevo cliente'}</Typography>
                  </Box>
                  <IconButton size="small" onClick={handleClearSelectedCustomer} sx={{ color: '#1A73E8' }}>
                    <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                  </IconButton>
                </Box>
              ) : (
                <TextField 
                  fullWidth label="CLIENTE *" required placeholder="Buscar por nombre, correo o teléfono..."
                  value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} onFocus={() => customerSearch.length >= 2 && setShowResults(true)}
                  InputLabelProps={{ sx: { fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' } }}
                  InputProps={{ 
                    sx: { height: 56, fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' },
                    endAdornment: isSearching ? <CircularProgress size={20} /> : null,
                    startAdornment: <InputAdornment position="start"><span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>search</span></InputAdornment>,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: (isNameInvalid && formState.name === '' && !customerSearch) ? '#D93025' : '#DADCE0' }
                  }}
                />
              )}
              {showResults && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, mt: 0.5, border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                  <List sx={{ py: 0 }}>
                    {customersResults.length > 0 ? (
                      <>
                        <ListItem sx={{ bgcolor: '#F1F3F4', py: 1 }}><Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#70757A', textTransform: 'uppercase' }}>Clientes existentes</Typography></ListItem>
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
                            <ListItemText primary={<Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</Typography>} secondary={<Typography sx={{ fontSize: '12px', color: '#70757A' }}>{c.phone || c.email || 'Sin contacto'}</Typography>} />
                            <span className="material-icons" style={{ fontSize: 18, color: '#1A73E8' }}>chevron_right</span>
                          </ListItem>
                        ))}
                      </>
                    ) : (
                      <ListItem sx={{ p: '16px', color: '#70757A' }}><Typography sx={{ fontSize: '13px' }}>No se encontró '{customerSearch}'</Typography></ListItem>
                    )}
                  </List>
                </Paper>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out', maxHeight: showContactFields ? '200px' : '0px', opacity: showContactFields ? 1 : 0 }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>Email</Typography>
              <TextField placeholder="correo@ejemplo.com" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out', maxHeight: showContactFields ? '200px' : '0px', opacity: showContactFields ? 1 : 0 }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>{selectedCustomer ? 'WhatsApp' : 'WhatsApp *'}</Typography>
              <TextField value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} placeholder="+34 000 000 000" error={isPhoneInvalid && formState.phone !== ''} InputProps={{ sx: { height: 56, fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }} />
              {isPhoneInvalid && formState.phone === '' && <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>El WhatsApp es obligatorio para nuevos clientes</Typography>}
            </Box>
          </Box>
        </Paper>

        {/* RIGHT PANEL: RESERVA */}
        <Paper sx={{ flex: 1, p: '24px', borderRadius: '4px', border: compact ? 'none' : '1px solid #E0E0E0', boxShadow: 'none', width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: '16px', borderBottom: '1px solid #E0E0E0', mb: '20px' }}>
            <span className="material-icons" style={{ fontSize: 20, color: '#1A73E8' }}>event</span>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>Reserva</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box sx={{ display: 'flex', gap: '16px' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>FECHA <span style={{ color: '#D93025' }}>*</span></Typography>
                <Button onClick={e => setAnchorEl(e.currentTarget)} sx={{ height: 56, borderRadius: '4px', border: '1px solid #DADCE0', justifyContent: 'flex-start', px: '14px', color: '#202124', fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', textTransform: 'none', bgcolor: '#FFFFFF', '&:hover': { border: '1px solid #202124', bgcolor: 'transparent' } }}>
                  {formState.date ? formState.date : 'Seleccione una fecha'}
                </Button>
                <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} PaperProps={{ sx: { mt: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px' } }}>
                  <Box sx={{ p: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0' }}>
                    <IconButton onClick={() => { if(calendarMonth===0){setCalendarMonth(11);setCalendarYear(y=>y-1);}else{setCalendarMonth(calendarMonth-1);} }} size="small"><span className="material-icons" style={{fontSize: 20}}>chevron_left</span></IconButton>
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>{MONTHS[calendarMonth]} {calendarYear}</Typography>
                    <IconButton onClick={() => { if(calendarMonth===11){setCalendarMonth(0);setCalendarYear(y=>y+1);}else{setCalendarMonth(calendarMonth+1);} }} size="small"><span className="material-icons" style={{fontSize: 20}}>chevron_right</span></IconButton>
                  </Box>
                  {renderCalendarDays()}
                </Popover>
                {isBlockedDay && <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>Este día está cerrado</Typography>}
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>HORA</Typography>
                <FormControl fullWidth>
                  <Select
                    displayEmpty
                    value={formState.time}
                    onChange={e => setFormState({...formState, time: e.target.value})}
                    disabled={isBlockedDay || allAvailableSlots.length === 0}
                    IconComponent={(props) => <span {...props} className={"material-icons " + props.className} style={{ color: '#70757A' }}>arrow_drop_down</span>}
                    sx={{ height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', color: '#202124', bgcolor: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0' } }}
                    renderValue={(val) => { if (!val) return <span style={{color: '#70757A'}}>Sin horarios</span>; return val; }}
                  >
                    {!availableShifts.length && initialData?.time && <MenuItem value={initialData.time}>{initialData.time}</MenuItem>}
                    {availableShifts.map((shiftGroup, gIdx) => [
                      <MenuItem disabled key={`header-${gIdx}`} sx={{ opacity: '1 !important', py: '10px' }}>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1px' }}>── {shiftGroup.name} ──</Typography>
                      </MenuItem>,
                      ...shiftGroup.slots.map(t => <MenuItem key={t} value={t} sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124', pl: '24px' }}>{t}</MenuItem>)
                    ])}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>PERSONAS</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
                <Button onClick={() => setFormState(prev => ({ ...prev, guests: Math.max(globalSettings?.minGuests || 1, Number(prev.guests) - 1) }))} sx={{ minWidth: 32, width: 32, height: 32, p: 0, border: '1px solid #DADCE0', borderRadius: '4px', color: '#202124' }}><span className="material-icons" style={{ fontSize: 18 }}>remove</span></Button>
                <Typography sx={{ width: 48, textAlign: 'center', fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>{formState.guests}</Typography>
                <Button onClick={() => setFormState(prev => ({ ...prev, guests: Math.min(globalSettings?.maxGuests || 20, Number(prev.guests) + 1) }))} sx={{ minWidth: 32, width: 32, height: 32, p: 0, border: '1px solid #DADCE0', borderRadius: '4px', color: '#202124' }}><span className="material-icons" style={{ fontSize: 18 }}>add</span></Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>ZONA</Typography>
              <FormControl fullWidth>
                <Select
                  value={zoneId} onChange={(e) => setZoneId(e.target.value)} disabled={zonesLoading || zonesError}
                  sx={{ height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', bgcolor: '#FFFFFF' }}
                >
                  {zonesLoading && <MenuItem value="" disabled>Cargando...</MenuItem>}
                  {zonesError && <MenuItem value="" disabled>Error al cargar</MenuItem>}
                  {zones.length > 0 ? zones.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>) : <MenuItem value={zoneId} sx={{ display: 'none' }} />}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>EVENTO</Typography>
              <FormControl fullWidth>
                <Select
                  value={eventId} onChange={(e) => setEventId(e.target.value)} disabled={eventsLoading || eventsError}
                  sx={{ height: 56, borderRadius: '4px', fontFamily: 'Roboto', fontSize: '14px', bgcolor: '#FFFFFF' }}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {eventsLoading && <MenuItem value="" disabled>Cargando...</MenuItem>}
                  {eventsError && <MenuItem value="" disabled>Error al cargar</MenuItem>}
                  {events.length > 0 && events.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {!showNotes ? (
                <Button onClick={() => setShowNotes(true)} sx={{ width: 'fit-content', p: 0, minWidth: 0, color: '#1A73E8', fontFamily: 'Roboto', fontSize: '14px', textTransform: 'none', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                  + Añadir nota
                </Button>
              ) : (
                <Box sx={{ overflow: 'hidden', transition: 'max-height 200ms ease-in-out', maxHeight: '200px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '4px' }}>NOTAS (Opcional)</Typography>
                  <TextField fullWidth multiline rows={3} value={formState.notes} onChange={e => setFormState({...formState, notes: e.target.value})} placeholder="Peticiones especiales, alergias..." InputProps={{ sx: { fontFamily: 'Roboto', fontSize: '14px', color: '#202124', borderRadius: '4px', bgcolor: '#FFFFFF' } }} />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* FOOTER BUTTONS */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', mt: 'auto', p: compact ? '0 24px 24px 24px' : 0 }}>
        <Button 
          variant="outlined" onClick={onCancel} disabled={saveStatus === 'loading'}
          sx={{ color: '#70757A', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', minWidth: 100, textTransform: 'uppercase', borderColor: '#DADCE0', '&:hover': { bgcolor: '#F1F3F4', borderColor: '#DADCE0' } }}
        >
          CANCELAR
        </Button>
        <Button 
          variant="contained" onClick={handleSaveBooking} disabled={saveStatus === 'loading' || saveStatus === 'success' || !isFormValid}
          sx={{ height: 44, px: '24px', bgcolor: saveStatus === 'success' ? '#137333' : '#1A73E8', boxShadow: 'none', borderRadius: '4px', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.25px', color: '#FFFFFF', transition: 'background-color 200ms ease', '&:hover': { bgcolor: saveStatus === 'success' ? '#137333' : '#1557B0', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: saveStatus === 'success' ? '#137333' : '#E0E0E0', color: saveStatus === 'success' ? '#FFFFFF' : '#BDBDBD' } }}
        >
          {saveStatus === 'loading' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>sync</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              GUARDANDO...
            </Box>
          ) : saveStatus === 'success' ? '✓ GUARDADO' : (isEditing ? 'GUARDAR' : 'CREAR RESERVA')}
        </Button>
      </Box>
    </Box>
  );
}
