import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, IconButton, Paper, 
  CircularProgress, Tooltip, Avatar, Divider,
  Dialog, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, Drawer, Slide,
  Grid, InputAdornment, List, ListItem, ListItemText,
  ListItemAvatar, Alert, DialogTitle
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import { useSettingsStore } from '../store/useSettingsStore';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';

// --- CONSTANTS ---
const STATUS_COLORS = {
  'CONFIRMADA': { bg: '#E6F4EA', border: '#34A853', text: '#137333', dot: '#34A853', label: 'Confirmada' },
  'PENDIENTE':   { bg: '#FEF7E0', border: '#FBBC04', text: '#7D4A00', dot: '#FBBC04', label: 'Pendiente' },
  'ASISTIÓ':     { bg: '#E8F0FE', border: '#1A73E8', text: '#1A73E8', dot: '#1A73E8', label: 'Asistió' },
  'CANCELADA':   { bg: '#F1F3F4', border: '#DADCE0', text: '#80868B', dot: '#DADCE0', label: 'Cancelada' },
  'NO_ASISTIÓ':  { bg: '#FDECEA', border: '#C5221F', text: '#C5221F', dot: '#C5221F', label: 'No Asistió' }
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUV', 'VIE', 'SÁB'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// --- UTILS ---
const formatSlotTime = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
};

const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toTimeString = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDate = getStartOfWeek(start);
  const endDate = new Date(end);
  const endDay = end.getDay();
  const diff = endDay === 0 ? 0 : 7 - endDay;
  endDate.setDate(end.getDate() + diff);
  return { startDate, endDate };
};

const getWeekRange = (date) => {
  const startDate = getStartOfWeek(date);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return { startDate, endDate };
};

export default function CalendarPanel() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [loading, setLoading] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState(null);
  
  // Drag and Drop State
  const [dragRes, setDragRes] = useState(null);
  const [dragDiffY, setDragDiffY] = useState(0);
  const [initialMouseY, setInitialMouseY] = useState(0);
  const [confirmMove, setConfirmMove] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Booking Modal Advanced States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersResults, setCustomersResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [tableTypes, setTableTypes] = useState([]);
  const [tableTypesLoading, setTableTypesLoading] = useState(false);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [specialEventsLoading, setSpecialEventsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const searchRef = useRef(null);

  // App state
  const globalHours = useSettingsStore(state => state.globalHours);
  const fetchGlobalHours = useSettingsStore(state => state.fetchGlobalHours);
  const adminCalendar = useSettingsStore(state => state.adminCalendar);
  
  useEffect(() => {
    if (!dragRes) return;

    const handleMouseMove = (e) => {
      setDragDiffY(e.clientY - initialMouseY);
    };

    const handleMouseUp = () => {
      const startMins = toMinutes(globalHours.openingTime || '09:00');
      const resMins = toMinutes(dragRes.time);
      const currentTop = ((resMins - startMins) / 30) * 48;
      const finalTop = currentTop + dragDiffY;
      
      const newMins = Math.round((finalTop / 48) * 30) + startMins;
      const newTime = toTimeString(newMins);
      
      if (newTime !== dragRes.time.slice(0, 5)) {
        setConfirmMove({ id: dragRes.id, newTime });
      }
      
      setDragRes(null);
      setDragDiffY(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragRes, initialMouseY, globalHours]);

  const handleDragStart = (e, res) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    setDragRes(res);
    setInitialMouseY(e.clientY);
  };
  

  const visibleRange = useMemo(() => {
    if (view === 'month') return getMonthRange(currentDate);
    if (view === 'week') return getWeekRange(currentDate);
    return { startDate: currentDate, endDate: currentDate };
  }, [currentDate, view]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const from = formatDateISO(visibleRange.startDate);
      const to = formatDateISO(visibleRange.endDate);
      const data = await apiClient(`/admin/reservations?from=${from}&to=${to}&per_page=500`);
      setReservations(data.data ?? []);
    } catch (e) {
      console.error('Failed to fetch reservations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [visibleRange]);

  const handleToday = () => setCurrentDate(new Date());
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const periodLabel = useMemo(() => {
    if (view === 'month') {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (view === 'week') {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()].toLowerCase()} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
    }
    // Day view
    return `${DAY_NAMES_FULL[currentDate.getDay()]}, ${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()].toLowerCase()}`;
  }, [currentDate, view]);

  return (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      bgcolor: '#F1F3F4', overflow: 'hidden' 
    }}>
      {/* TOP BAR */}
      <Box sx={{ 
        height: 56, minHeight: 56, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0',
        display: 'flex', alignItems: 'center', px: '16px', justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            variant="outlined" onClick={handleToday}
            sx={{ 
              height: 36, px: '16px', borderRadius: '4px', border: '1px solid #DADCE0',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124',
              textTransform: 'none', '&:hover': { bgcolor: '#F1F3F4' }
            }}
          >
            Hoy
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconButton onClick={handlePrev} sx={{ width: 36, height: 36, borderRadius: '4px', '&:hover': { bgcolor: '#F1F3F4' } }}>
              <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
            </IconButton>
            <IconButton onClick={handleNext} sx={{ width: 36, height: 36, borderRadius: '4px', '&:hover': { bgcolor: '#F1F3F4' } }}>
              <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
            </IconButton>
          </Box>
          
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '22px', color: '#202124', ml: '8px' }}>
            {periodLabel}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Switcher */}
          <Box sx={{ 
            display: 'flex', height: 36, border: '1px solid #DADCE0', borderRadius: '4px', overflow: 'hidden' 
          }}>
            {[
              { id: 'month', label: 'Mes' },
              { id: 'week', label: 'Semana' },
              { id: 'day', label: 'Día' }
            ].map((v, i) => (
              <Box key={v.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  onClick={() => setView(v.id)}
                  sx={{ 
                    height: '100%', px: '16px', border: 'none', borderRadius: 0,
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px',
                    bgcolor: view === v.id ? '#E8F0FE' : '#FFFFFF',
                    color: view === v.id ? '#1A73E8' : '#70757A',
                    textTransform: 'none', '&:hover': { bgcolor: view === v.id ? '#E8F0FE' : '#F1F3F4' }
                  }}
                >
                  {v.label}
                </Button>
                {i < 2 && <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', bgcolor: '#DADCE0' }} />}
              </Box>
            ))}
          </Box>

          <Button 
            variant="contained" startIcon={<span className="material-icons" style={{ fontSize: 18 }}>add</span>}
            onClick={() => {
              setBookingInitialData(null);
              setIsBookingModalOpen(true);
            }}
            sx={{ 
              height: 36, px: '16px', borderRadius: '4px', bgcolor: '#1A73E8', boxShadow: 'none',
              fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', textTransform: 'none',
              '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
            }}
          >
            Nueva reserva
          </Button>
        </Box>
      </Box>

      {/* LEGEND BAR */}
      <Box sx={{ 
        height: 32, minHeight: 32, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0',
        display: 'flex', alignItems: 'center', px: '16px', gap: '24px'
      }}>
        {Object.entries(STATUS_COLORS).map(([key, data]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: data.dot }} />
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A' }}>
              {data.label}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A' }}>
            {reservations.length} reservas en este periodo
          </Typography>
        </Box>
      </Box>

      {/* CALENDAR CONTENT AREA */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* View Grid will go here */}
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            range={visibleRange} 
            reservations={reservations} 
            onCellClick={(date) => {
              setBookingInitialData({ date: formatDateISO(date) });
              setIsBookingModalOpen(true);
            }}
            onResClick={setSelectedRes}
          />
        )}
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            range={visibleRange} 
            reservations={reservations} 
            globalHours={globalHours}
            onResClick={setSelectedRes}
            handleDragStart={handleDragStart}
            dragRes={dragRes}
            dragDiffY={dragDiffY}
            onCellClick={(date, time) => {
              setBookingInitialData({ date: formatDateISO(date), time });
              setIsBookingModalOpen(true);
            }}
          />
        )}
        {view === 'day' && (
          <DayView 
            currentDate={currentDate} 
            reservations={reservations} 
            globalHours={globalHours}
            onResClick={setSelectedRes}
            handleDragStart={handleDragStart}
            dragRes={dragRes}
            dragDiffY={dragDiffY}
            onCellClick={(date, time) => {
              setBookingInitialData({ date: formatDateISO(date), time });
              setIsBookingModalOpen(true);
            }}
          />
        )}

        <ReservationDrawer 
          reservation={selectedRes} 
          onClose={() => setSelectedRes(null)} 
          onRefresh={fetchReservations}
          onEdit={(res) => {
            setSelectedRes(null);
            setBookingInitialData(res);
            setIsBookingModalOpen(true);
          }}
        />
        
        <BookingModal 
          open={isBookingModalOpen} 
          initialData={bookingInitialData}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingInitialData(null);
          }}
          onSuccess={() => {
            setIsBookingModalOpen(false);
            setBookingInitialData(null);
            fetchReservations();
          }}
        />

        {/* Drag Confirmation */}
        <Dialog open={!!confirmMove} onClose={() => setConfirmMove(null)}>
          <DialogTitle sx={{ fontFamily: 'Roboto', fontSize: '16px' }}>¿Mover reserva?</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>
              ¿Mover a las {confirmMove?.newTime}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmMove(null)} sx={{ color: '#70757A' }}>Cancelar</Button>
            <Button 
              onClick={async () => {
                const { id, newTime } = confirmMove;
                try {
                  await apiClient(`/admin/reservations/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ time: newTime })
                  });
                  fetchReservations();
                } catch (e) { console.error(e); }
                setConfirmMove(null);
              }} 
              sx={{ color: '#1A73E8', fontWeight: 500 }}
            >
              Mover
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

// --- SUB-COMPONENTS ---

function MonthView({ currentDate, range, reservations, onCellClick, onResClick }) {
  const days = useMemo(() => {
    const arr = [];
    let curr = new Date(range.startDate);
    while (curr <= range.endDate) {
      arr.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return arr;
  }, [range]);

  const reservationsByDate = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    // Sort by time
    Object.keys(map).forEach(d => {
      map[d].sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [reservations]);

  const todayStr = formatDateISO(new Date());
  
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverDate, setPopoverDate] = useState(null);

  const handleOpenMore = (e, date) => {
    e.stopPropagation();
    setPopoverAnchor(e.currentTarget);
    setPopoverDate(date);
  };

  const popoverRes = popoverDate ? (reservationsByDate[formatDateISO(popoverDate)] || []) : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid #E0E0E0', height: 40, minHeight: 40 }}>
        {DAY_NAMES_SHORT.slice(1).concat(DAY_NAMES_SHORT[0]).map(d => (
          <Box key={d} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E0E0E0' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A' }}>
              {d}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid Rows */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', overflowY: 'auto' }}>
        {days.map((date, i) => {
          const dateStr = formatDateISO(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = dateStr === todayStr;
          const dayRes = reservationsByDate[dateStr] || [];
          
          return (
            <Box 
              key={dateStr}
              onClick={() => onCellClick(date)}
              sx={{ 
                borderRight: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0',
                p: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
                minHeight: 120, bgcolor: isCurrentMonth ? '#FFFFFF' : '#F8F9FA',
                '&:hover': { bgcolor: '#F8F9FA' }
              }}
            >
              {/* Day Number */}
              <Box sx={{ display: 'flex', mb: '4px' }}>
                <Box sx={{ 
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: isToday ? '#1A73E8' : 'transparent',
                  color: isToday ? '#FFFFFF' : (isCurrentMonth ? '#70757A' : '#BDBDBD'),
                  fontFamily: 'Roboto', fontWeight: isToday ? 500 : 400, fontSize: '12px'
                }}>
                  {date.getDate()}
                </Box>
              </Box>

              {/* Chips */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                {dayRes.slice(0, 3).map(res => {
                  const colors = STATUS_COLORS[res.status] || STATUS_COLORS.pending;
                  return (
                    <Box 
                      key={res.id}
                      onClick={(e) => { e.stopPropagation(); onResClick(res); }}
                      sx={{ 
                        height: 22, px: '6px', borderRadius: '4px', bgcolor: colors.bg,
                        display: 'flex', alignItems: 'center', cursor: 'pointer',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        border: `1px solid ${colors.bg}` // subtle border
                      }}
                    >
                      <Typography sx={{ 
                        fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: colors.text,
                        overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {res.time.slice(0, 5)} {res.customer?.name}
                      </Typography>
                    </Box>
                  );
                })}
                {dayRes.length > 3 && (
                  <Box 
                    onClick={(e) => handleOpenMore(e, date)}
                    sx={{ 
                      height: 20, px: '6px', borderRadius: '4px', bgcolor: '#F1F3F4',
                      display: 'flex', alignItems: 'center', cursor: 'pointer',
                      '&:hover': { bgcolor: '#E0E0E0' }
                    }}
                  >
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A' }}>
                      +{dayRes.length - 3} más
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Popover for "More" */}
      <Dialog 
        open={Boolean(popoverAnchor)} 
        onClose={() => setPopoverAnchor(null)}
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 240 } }}
      >
        <Box sx={{ p: '12px' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '11px', color: '#70757A', fontWeight: 500, mb: '12px', textTransform: 'uppercase' }}>
            {popoverDate ? `${DAY_NAMES_FULL[popoverDate.getDay()]}, ${popoverDate.getDate()}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {popoverRes.map(res => {
              const colors = STATUS_COLORS[res.status] || STATUS_COLORS.pending;
              return (
                <Box 
                  key={res.id}
                  onClick={() => { onResClick(res); setPopoverAnchor(null); }}
                  sx={{ 
                    height: 24, px: '8px', borderRadius: '4px', bgcolor: colors.bg,
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: colors.text }}>
                    {res.time.slice(0, 5)} {res.customer?.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

function WeekView({ currentDate, range, reservations, globalHours, onResClick, handleDragStart, dragRes, dragDiffY, onCellClick }) {
  const days = useMemo(() => {
    const arr = [];
    let curr = new Date(range.startDate);
    while (arr.length < 7) {
      arr.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return arr;
  }, [range]);

  const timeSlots = useMemo(() => {
    const startMins = toMinutes(globalHours.openingTime || '09:00');
    let endMins = toMinutes(globalHours.closingTime || '00:00');
    if (endMins <= startMins) endMins += 1440;
    
    const slots = [];
    for (let m = startMins; m < endMins; m += 30) {
      slots.push(toTimeString(m));
    }
    return slots;
  }, [globalHours]);

  const reservationsByDay = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [reservations]);

  const todayStr = formatDateISO(new Date());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', borderBottom: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ width: 60, borderRight: '1px solid #E0E0E0', flexShrink: 0 }} />
        {days.map(date => {
          const dateStr = formatDateISO(date);
          const isToday = dateStr === todayStr;
          return (
            <Box key={dateStr} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: '8px', borderRight: '1px solid #E0E0E0' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '11px', color: '#70757A', fontWeight: 500 }}>
                {DAY_NAMES_SHORT[date.getDay()]}
              </Typography>
              <Box sx={{ 
                width: 36, height: 36, borderRadius: '50%', mt: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: isToday ? '#1A73E8' : 'transparent',
                color: isToday ? '#FFFFFF' : '#202124',
                fontFamily: 'Roboto', fontSize: '22px'
              }}>
                {date.getDate()}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', overflowY: 'auto', position: 'relative' }}>
        <Box sx={{ width: 60, flexShrink: 0, borderRight: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
          {timeSlots.map(time => (
            <Box key={time} sx={{ height: 48, position: 'relative' }}>
              {time.endsWith(':00') && (
                <Typography sx={{ 
                  position: 'absolute', top: -6, right: 8, 
                  fontFamily: 'Roboto', fontSize: '11px', color: '#70757A' 
                }}>
                  {time}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
        {days.map(date => {
          const dateStr = formatDateISO(date);
          const dayRes = reservationsByDay[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <Box key={dateStr} sx={{ flex: 1, borderRight: '1px solid #E0E0E0', position: 'relative', bgcolor: isToday ? '#FAFBFF' : 'transparent' }}>
              {timeSlots.map(time => (
                <Box 
                  key={time} 
                  onClick={() => onCellClick(date, time)}
                  sx={{ height: 48, borderBottom: `1px solid ${time.endsWith(':00') ? '#E0E0E0' : '#F1F3F4'}`, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(26, 115, 232, 0.04)' } }} 
                />
              ))}
              {renderDayReservations(dayRes, globalHours, onResClick, false, handleDragStart, dragRes, dragDiffY)}
              {isToday && <CurrentTimeLine startMins={toMinutes(globalHours.openingTime || '09:00')} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function DayView({ currentDate, reservations, globalHours, onResClick, handleDragStart, dragRes, dragDiffY, onCellClick }) {
  const dateStr = formatDateISO(currentDate);
  const dayRes = reservations.filter(r => r.date === dateStr);
  const isToday = dateStr === formatDateISO(new Date());
  const timeSlots = useMemo(() => {
    const startMins = toMinutes(globalHours.openingTime || '09:00');
    let endMins = toMinutes(globalHours.closingTime || '00:00');
    if (endMins <= startMins) endMins += 1440;
    const slots = [];
    for (let m = startMins; m < endMins; m += 30) {
      slots.push(toTimeString(m));
    }
    return slots;
  }, [globalHours]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', overflowY: 'auto', position: 'relative' }}>
        <Box sx={{ width: 60, flexShrink: 0, borderRight: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
          {timeSlots.map(time => (
            <Box key={time} sx={{ height: 48, position: 'relative' }}>
              {time.endsWith(':00') && (
                <Typography sx={{ position: 'absolute', top: -6, right: 8, fontFamily: 'Roboto', fontSize: '11px', color: '#70757A' }}>
                  {time}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, position: 'relative' }}>
          {timeSlots.map(time => (
            <Box 
              key={time} 
              onClick={() => onCellClick(currentDate, time)}
              sx={{ height: 48, borderBottom: `1px solid ${time.endsWith(':00') ? '#E0E0E0' : '#F1F3F4'}`, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(26, 115, 232, 0.04)' } }} 
            />
          ))}
          {renderDayReservations(dayRes, globalHours, onResClick, true, handleDragStart, dragRes, dragDiffY)}
          {isToday && <CurrentTimeLine startMins={toMinutes(globalHours.openingTime || '09:00')} />}
        </Box>
      </Box>
    </Box>
  );
}

function renderDayReservations(dayRes, globalHours, onResClick, isDayView = false, onDragStart, dragRes, dragDiffY) {
  const grouped = {};
  dayRes.sort((a, b) => a.time.localeCompare(b.time)).forEach(r => {
    if (!grouped[r.time]) grouped[r.time] = [];
    grouped[r.time].push(r);
  });
  const startMins = toMinutes(globalHours.openingTime || '09:00');
  return Object.values(grouped).flatMap(group => {
    const widthPercent = 100 / group.length;
    return group.map((res, idx) => {
      const resMins = toMinutes(res.time);
      let top = ((resMins - startMins) / 30) * 48;
      const isDragging = dragRes?.id === res.id;
      if (isDragging) {
        top += dragDiffY;
      }
      
      const colors = STATUS_COLORS[res.status?.toUpperCase()] || STATUS_COLORS.CONFIRMADA;
      return (
        <Box 
          key={res.id} 
          onClick={(e) => { e.stopPropagation(); onResClick(res); }} 
          onMouseDown={(e) => onDragStart && onDragStart(e, res)}
          sx={{ 
            position: 'absolute', top: top + 2, left: `${idx * widthPercent}%`, width: `calc(${widthPercent}% - 4px)`, 
            height: 44, bgcolor: colors.bg, borderRadius: '4px', borderLeft: `3px solid ${colors.border}`, 
            p: '4px 8px', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'grab', zIndex: isDragging ? 100 : 5, 
            transition: isDragging ? 'none' : 'all 200ms ease', 
            '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 10 },
            ...(isDragging && { opacity: 0.7, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'grabbing' })
          }}
        >
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: colors.text }}>
            {res.time.slice(0, 5)} · {res.customer?.name}
          </Typography>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '11px', color: '#70757A' }}>
            {res.guests} pers · {res.table_type?.name}
          </Typography>
        </Box>
      );
    });
  });
}

function CurrentTimeLine({ startMins }) {
  const [mins, setMins] = useState(new Date().getHours() * 60 + new Date().getMinutes());
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setMins(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const top = ((mins - startMins) / 30) * 48;
  if (top < 0) return null;
  return (
    <Box sx={{ position: 'absolute', top, left: 0, right: 0, height: 2, bgcolor: '#D93025', zIndex: 20, pointerEvents: 'none' }}>
      <Box sx={{ position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: '50%', bgcolor: '#D93025' }} />
    </Box>
  );
}

function ReservationDrawer({ reservation, onClose, onRefresh, onEdit }) {
  const [loading, setLoading] = useState(false);

  if (!reservation) return null;

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient(`/admin/reservations/${reservation.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      onRefresh();
      onClose();
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setLoading(false);
    }
  };

  const colors = STATUS_COLORS[reservation.status?.toUpperCase()] || STATUS_COLORS.PENDIENTE;

  return (
    <Drawer
      anchor="right"
      open={!!reservation}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, borderLeft: 'none', boxShadow: '-4px 0 12px rgba(0,0,0,0.1)' } }}
    >
      <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124' }}>
            Detalles de Reserva
          </Typography>
          <IconButton onClick={onClose} size="small">
            <span className="material-icons">close</span>
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '24px' }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: '#1A73E8' }}>
            {reservation.customer?.name?.[0].toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
              {reservation.customer?.name}
            </Typography>
            <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', bgcolor: colors.bg, display: 'inline-block', mt: '4px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: colors.text, textTransform: 'uppercase' }}>
                {colors.label}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: '24px' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <InfoRow icon="calendar_today" label="Fecha" value={reservation.date} />
          <InfoRow icon="schedule" label="Hora" value={reservation.time.slice(0, 5)} />
          <InfoRow icon="people" label="Comensales" value={`${reservation.guests} personas`} />
          <InfoRow icon="table_restaurant" label="Mesa" value={reservation.table_type?.name || 'Cualquiera'} />
          <InfoRow icon="event" label="Evento" value={reservation.special_event?.name || 'Venta Estándar'} />
          <InfoRow icon="phone" label="Teléfono" value={reservation.customer?.phone || 'Sin teléfono'} />
          <InfoRow icon="email" label="Email" value={reservation.customer?.email || 'Sin email'} />
          
          {reservation.special_requests && (
            <Box sx={{ mt: '8px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
                Notas Especiales
              </Typography>
              <Paper sx={{ p: '12px', bgcolor: '#F8F9FA', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>
                  {reservation.special_requests}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 12, mt: '24px' }}>
          <Button 
            fullWidth variant="text" onClick={() => navigate(`/admin/reservations/${reservation.id}`)}
            sx={{ color: '#1A73E8', textTransform: 'none', fontWeight: 500, mb: 1 }}
          >
            Ver detalles completos
          </Button>
          {reservation.status === 'PENDIENTE' && (
            <Button 
              fullWidth variant="contained" onClick={() => handleStatusUpdate('CONFIRMADA')}
              disabled={loading}
              sx={{ bgcolor: '#34A853', '&:hover': { bgcolor: '#2D8E47' }, textTransform: 'none', py: '10px' }}
            >
              Confirmar Reserva
            </Button>
          )}
          {reservation.status === 'CONFIRMADA' && (
            <Button 
              fullWidth variant="contained" onClick={() => handleStatusUpdate('ASISTIÓ')}
              disabled={loading}
              sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' }, textTransform: 'none', py: '10px' }}
            >
              Marcar como Llegado
            </Button>
          )}

          {/* EDIT BUTTON */}
          <Button 
            fullWidth variant="outlined" onClick={() => onEdit(reservation)}
            disabled={loading}
            sx={{ color: '#1A73E8', borderColor: '#DADCE0', '&:hover': { bgcolor: '#E8F0FE', borderColor: '#1A73E8' }, textTransform: 'none', py: '10px' }}
          >
            Editar Reserva
          </Button>

          {reservation.status !== 'CANCELADA' && (
            <Button 
              fullWidth variant="outlined" onClick={() => handleStatusUpdate('CANCELADA')}
              disabled={loading}
              sx={{ color: '#D93025', borderColor: '#DADCE0', '&:hover': { bgcolor: '#FEEBEE', borderColor: '#D93025' }, textTransform: 'none', py: '10px' }}
            >
              Cancelar Reserva
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <span className="material-icons" style={{ color: '#70757A', fontSize: 20, marginTop: 2 }}>{icon}</span>
      <Box>
        <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', textTransform: 'uppercase', fontWeight: 500, mb: '2px' }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: 'Roboto', fontSize: '15px', color: '#202124' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function BookingModal({ open, initialData, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const adminCalendar = useSettingsStore(state => state.adminCalendar);
  const globalSettings = useSettingsStore(state => state.globalSettings);
  const storeLoading = useSettingsStore(state => state.loading);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: '', status: 'CONFIRMADA'
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customersResults, setCustomersResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [tableTypes, setTableTypes] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [tableTypeId, setTableTypeId] = useState('');
  const [specialEventId, setSpecialEventId] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        // Edit Mode
        setForm({
          name: initialData.customer?.name || '',
          phone: initialData.customer?.phone || '',
          email: initialData.customer?.email || '',
          date: initialData.date,
          time: initialData.time.slice(0, 5),
          guests: initialData.guests,
          notes: initialData.special_requests || '',
          status: initialData.status
        });
        setSelectedCustomer(initialData.customer);
        setTableTypeId(initialData.table_type_id || '');
        setSpecialEventId(initialData.special_event_id || '');
        setShowNotes(!!initialData.special_requests);
      } else {
        // New Mode
        setForm({
          name: '', phone: '', email: '', 
          date: initialData?.date || formatDateISO(new Date()),
          time: initialData?.time || '',
          guests: globalSettings?.minGuests || 2,
          notes: '',
          status: 'CONFIRMADA'
        });
        setSelectedCustomer(null);
        setCustomerSearch('');
        setShowNotes(false);
      }
      fetchDependencies();
    }
  }, [open, initialData, globalSettings]);

  const fetchDependencies = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        apiClient('/admin/table-types'),
        apiClient('/admin/special-events')
      ]);
      const activeTypes = (tRes.data ?? tRes).filter(t => t.is_active);
      const activeEvents = (eRes.data ?? eRes).filter(e => e.is_active);
      setTableTypes(activeTypes);
      setSpecialEvents(activeEvents);
      if (!initialData?.id) {
        if (activeTypes.length > 0) setTableTypeId(activeTypes[0].id);
        if (activeEvents.length > 0) setSpecialEventId('');
      }
    } catch (err) { console.error(err); }
  };

  // Customer search logic
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
        setCustomersResults(data.data ?? data);
        setShowResults(true);
      } catch (err) { console.error(err); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setForm(prev => ({ ...prev, name: customer.name, email: customer.email || '', phone: customer.phone || '' }));
    setCustomerSearch('');
    setShowResults(false);
  };

  const dayNameKey = form.date ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(form.date + 'T12:00:00').getDay()] : '';
  const dayConfig = adminCalendar?.schedule?.[dayNameKey];
  
  const availableSlots = useMemo(() => {
    if (!dayConfig?.open || !dayConfig?.shifts) return [];
    const slots = [];
    dayConfig.shifts.forEach(shift => {
      const oMins = toMinutes(shift.openingTime);
      let cMins = toMinutes(shift.closingTime);
      if (cMins <= oMins) cMins += 1440;
      for (let t = oMins; t <= cMins; t += shift.interval) {
        slots.push(toTimeString(t));
      }
    });
    return slots;
  }, [dayConfig]);

  useEffect(() => {
    if (!initialData?.id && availableSlots.length > 0 && !form.time) {
      setForm(prev => ({ ...prev, time: availableSlots[0] }));
    }
  }, [availableSlots, initialData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...(selectedCustomer ? { customer_id: selectedCustomer.id } : { user: { name: form.name, phone: form.phone, email: form.email || null } }),
        date: form.date,
        slot: { time: form.time }, // for adminStore/store
        time: form.time, // for update
        guests: form.guests,
        table_type_id: tableTypeId,
        special_event_id: specialEventId || null,
        special_requests: form.notes,
        status: form.status,
        name: form.name, // for update
        email: form.email, // for update
        phone: form.phone // for update
      };

      if (initialData?.id) {
        await apiClient(`/admin/reservations/${initialData.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiClient('/admin/reservations', { method: 'POST', body: JSON.stringify(payload) });
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      alert('Error al guardar la reserva');
    } finally { setLoading(false); }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: '4px', 
          p: 0,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: '20px 24px', 
        fontFamily: 'Roboto', 
        fontWeight: 500, 
        fontSize: '18px',
        color: '#202124',
        borderBottom: '1px solid #E0E0E0', 
        bgcolor: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {initialData?.id ? 'Editar Reserva' : 'Nueva Reserva'}
        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
          <span className="material-icons">close</span>
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: '24px', mt: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#DADCE0', borderRadius: 2 } }}>
        <Grid container spacing={4}>
          {/* CLIENTE PANEL */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <span className="material-icons" style={{ color: '#1A73E8', fontSize: 20 }}>account_circle</span>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cliente
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {selectedCustomer ? (
                <Paper variant="outlined" sx={{ p: '12px 16px', bgcolor: '#F8F9FA', borderRadius: '4px', border: '1px solid #DADCE0', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#1A73E8', fontSize: 16 }}>{selectedCustomer.name[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>{selectedCustomer.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#1A73E8', fontWeight: 500 }}>Cliente seleccionado</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedCustomer(null)} sx={{ color: '#5F6368' }}>
                      <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                    </IconButton>
                  </Box>
                </Paper>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <TextField 
                    fullWidth label="Nombre del Cliente" size="small"
                    value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                    onFocus={() => customerSearch.length >= 2 && setShowResults(true)}
                    placeholder="Escribe para buscar o crear..."
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>search</span>
                        </InputAdornment>
                      ),
                      endAdornment: isSearching ? <CircularProgress size={16} /> : null
                    }}
                  />
                  {showResults && (
                    <Paper 
                      elevation={4}
                      sx={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, mt: 0.5, 
                        border: '1px solid #E0E0E0', borderRadius: '4px', overflow: 'hidden'
                      }}
                    >
                      <List size="small" sx={{ p: 0 }}>
                        {customersResults.map(c => (
                          <ListItem key={c.id} button onClick={() => handleSelectCustomer(c)} sx={{ '&:hover': { bgcolor: '#F1F3F4' } }}>
                            <ListItemText 
                              primary={c.name} 
                              secondary={c.phone || c.email} 
                              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                              secondaryTypographyProps={{ fontSize: 12 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              )}
              
              <TextField 
                fullWidth label="WhatsApp" size="small" value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                placeholder="+34 000 000 000"
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>phone</span>
                    </InputAdornment>
                  )
                }}
              />
              <TextField 
                fullWidth label="Email" size="small" value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>email</span>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Grid>

          {/* RESERVA PANEL */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <span className="material-icons" style={{ color: '#1A73E8', fontSize: 20 }}>event_note</span>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Reserva
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  sx={{ flex: 1 }} type="date" label="Fecha" size="small" value={form.date} 
                  onChange={e => setForm({...form, date: e.target.value})} InputLabelProps={{ shrink: true }} 
                />
                <FormControl sx={{ flex: 1 }} size="small">
                  <Select 
                    value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                    displayEmpty renderValue={val => val || 'Slot'}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}>
                        <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>schedule</span>
                      </InputAdornment>
                    }
                  >
                    {availableSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 2, 
                p: '8px 12px', border: '1px solid #DADCE0', borderRadius: '4px',
                bgcolor: '#FFFFFF'
              }}>
                <Typography sx={{ flex: 1, fontSize: 14, color: '#202124', fontWeight: 500 }}>Comensales:</Typography>
                <IconButton size="small" onClick={() => setForm({...form, guests: Math.max(1, form.guests - 1)})} sx={{ color: '#5F6368' }}>
                  <span className="material-icons" style={{ fontSize: 22 }}>remove_circle_outline</span>
                </IconButton>
                <Typography sx={{ width: 24, textAlign: 'center', fontWeight: 501, fontSize: '15px', color: '#202124' }}>{form.guests}</Typography>
                <IconButton size="small" onClick={() => setForm({...form, guests: form.guests + 1})} sx={{ color: '#5F6368' }}>
                  <span className="material-icons" style={{ fontSize: 22 }}>add_circle_outline</span>
                </IconButton>
              </Box>

              <FormControl fullWidth size="small">
                <Select 
                  value={tableTypeId} onChange={e => setTableTypeId(e.target.value)} 
                  displayEmpty renderValue={v => tableTypes.find(t=>t.id===v)?.name || 'Tipo de Mesa'}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}>
                      <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>table_restaurant</span>
                    </InputAdornment>
                  }
                >
                  {tableTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <Select 
                  value={specialEventId} onChange={e => setSpecialEventId(e.target.value)} 
                  displayEmpty renderValue={v => specialEvents.find(e=>e.id===v)?.name || 'Evento Especial (Opcional)'}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}>
                      <span className="material-icons" style={{ color: '#70757A', fontSize: 18 }}>stars</span>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {specialEvents.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              {!showNotes ? (
                <Button 
                  onClick={() => setShowNotes(true)} 
                  startIcon={<span className="material-icons" style={{ fontSize: 18 }}>add</span>}
                  sx={{ 
                    color: '#1A73E8', textTransform: 'none', alignSelf: 'flex-start', p: '2px 8px',
                    fontSize: '13px', fontWeight: 500, '&:hover': { bgcolor: '#E8F0FE' }
                  }}
                >
                  Añadir nota
                </Button>
              ) : (
                <TextField 
                  fullWidth multiline rows={2} label="Notas" size="small" value={form.notes} 
                  onChange={e => setForm({...form, notes: e.target.value})} 
                  autoFocus
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', gap: 1 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: '#5F6368', textTransform: 'uppercase', fontWeight: 500, fontSize: '13px', px: 2,
            letterSpacing: '0.5px'
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" onClick={handleSubmit} disabled={loading || !form.name || !form.phone || !form.time}
          sx={{ 
            bgcolor: '#1A73E8', boxShadow: 'none', '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
            textTransform: 'uppercase', fontWeight: 500, fontSize: '13px', px: 3, py: 1,
            letterSpacing: '0.5px'
          }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : (initialData?.id ? 'Guardar Cambios' : 'Guardar Reserva')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
