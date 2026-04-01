import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, IconButton, Paper, 
  CircularProgress, Tooltip, Divider,
  Dialog, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, Drawer, SwipeableDrawer, Slide,
  Grid, InputAdornment, List, ListItem, ListItemText,
  ListItemAvatar, Alert, DialogTitle
} from '@mui/material';
import { apiClient } from '../../shared/api';
import CustomerAvatar from '../components/CustomerAvatar';
import { useSettingsStore } from '../store/useSettingsStore';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';
import ReservationFormModal from '../components/ReservationFormModal';
import { useToast } from '../components/Toast/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

// --- CONSTANTS ---
const STATUS_COLORS = {
  'CONFIRMADA': { bg: '#E8F0FE', border: '#1A73E8', text: '#1A73E8', dot: '#1A73E8', label: 'Confirmada' },
  'PENDIENTE':   { bg: '#FEF7E0', border: '#FBBC04', text: '#7D4A00', dot: '#FBBC04', label: 'Pendiente' },
  'ASISTIÓ':     { bg: '#E6F4EA', border: '#34A853', text: '#137333', dot: '#34A853', label: 'Asistió' },
  'CANCELADA':   { bg: '#F1F3F4', border: '#DADCE0', text: '#80868B', dot: '#DADCE0', label: 'Cancelada' },
  'NO_ASISTIÓ':  { bg: '#FDECEA', border: '#C5221F', text: '#C5221F', dot: '#C5221F', label: 'No asistió' }
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
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
  const toast = useToast();
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
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
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
            setBookingInitialData(res);
            setIsBookingModalOpen(true);
          }}
        />
        
        {isBookingModalOpen && (
          <ReservationFormModal 
            open={isBookingModalOpen} 
            reservationData={bookingInitialData}
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
        )}

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
            {res.guests} pers · {res.zone?.name}
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
  const [optimisticStatus, setOptimisticStatus] = useState(reservation?.status);
  const toast = useToast();
  const [cancelReason, setCancelReason] = useState('');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (reservation) setOptimisticStatus(reservation.status);
  }, [reservation]);

  if (!reservation) return null;

  const currentStatus = optimisticStatus || reservation.status;

  const handleStatusUpdate = async (newStatus, reason = null) => {
    if (newStatus === currentStatus && !reason) return;
    
    if (newStatus === 'CANCELADA' && !reason) {
      setConfirmCancelOpen(true);
      return;
    }

    setOptimisticStatus(newStatus);
    toast.success('Estado actualizado');
    setLoading(true);
    try {
      await apiClient(`/admin/reservations/${reservation.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: newStatus,
          cancellation_reason: reason 
        })
      });
      setConfirmCancelOpen(false);
      setCancelReason('');
      onRefresh(); // Refresh background silently
    } catch (e) {
      console.error('Failed to update status', e);
      setOptimisticStatus(reservation.status); // Revert
    } finally {
      setLoading(false);
    }
  };

  const STATUS_BUTTONS = [
    { label: 'Pendiente', value: 'PENDIENTE', activeBg: '#F9AB00' },
    { label: 'Confirmada', value: 'CONFIRMADA', activeBg: '#1A73E8' },
    { label: 'Asistió', value: 'ASISTIÓ', activeBg: '#137333' },
    { label: 'Cancelada', value: 'CANCELADA', activeBg: '#D93025' }
  ];

  return (
    <>
      <SwipeableDrawer
        anchor="right"
        open={true}
        onClose={onClose}
        onOpen={() => {}}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, borderLeft: 'none', boxShadow: '-4px 0 12px rgba(0,0,0,0.1)' } }}
      >
        <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124' }}>
              DETALLES DE LA RESERVA
            </Typography>
            <IconButton onClick={onClose} size="small">
              <span className="material-icons">close</span>
            </IconButton>
          </Box>

          {/* CUSTOMER HEADER INFO */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '24px' }}>
            <CustomerAvatar 
              name={reservation.customer?.name} 
              counts={{
                total: reservation.customer?.reservations_count,
                arrived: reservation.customer?.arrived_count,
                noShow: reservation.customer?.no_show_count
              }}
              size={48}
              onClick={() => { onClose(); navigate(`/admin/customers/${reservation.customer?.id}`); }}
            />
            <Box>
              <Typography 
                sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#1A73E8', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => { onClose(); navigate(`/admin/customers/${reservation.customer?.id}`); }}
              >
                {reservation.customer?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                  {reservation.customer?.phone || 'Sin teléfono'}
                </Typography>
                {(() => {
                  const colors = STATUS_COLORS[currentStatus?.toUpperCase()] || STATUS_COLORS.PENDIENTE;
                  return (
                    <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', bgcolor: colors.bg, display: 'inline-block' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: colors.text, textTransform: 'uppercase' }}>
                        {colors.label}
                      </Typography>
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: '24px' }} />

          {/* STATUS BUTTONS */}
          <Box sx={{ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' }}>
            {STATUS_BUTTONS.map((btn) => {
              const isActive = currentStatus?.toUpperCase() === btn.value;
              return (
                <Button
                  key={btn.value}
                  onClick={() => handleStatusUpdate(btn.value)}
                  disabled={loading && currentStatus !== btn.value}
                  sx={{
                    flex: 1, minWidth: '45%', gap: '6px', height: 32, borderRadius: '4px',
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', textTransform: 'none',
                    border: isActive ? 'none' : '1px solid #DADCE0',
                    color: isActive ? '#FFFFFF' : '#70757A',
                    bgcolor: isActive ? btn.activeBg : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? btn.activeBg : '#F1F3F4'
                    }
                  }}
                >
                  {btn.label}
                </Button>
              );
            })}
          </Box>

          {/* OTHER DETAILS */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <InfoRow icon="calendar_today" label="FECHA" value={reservation.date} />
            <InfoRow icon="schedule" label="HORA" value={reservation.time.slice(0, 5)} />
            <InfoRow icon="people" label="PERSONAS" value={`${reservation.guests} personas`} />
            <InfoRow icon="table_restaurant" label="ZONA" value={reservation.zone?.name || 'Cualquiera'} />
            <InfoRow icon="event" label="EVENTO" value={reservation.event?.name || 'Venta Estándar'} />
            
            {reservation.special_requests && (
              <Box sx={{ mt: '8px' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
                  NOTAS ESPECIALES
                </Typography>
                <Paper sx={{ p: '12px', bgcolor: '#F8F9FA', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>
                    {reservation.special_requests}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* QUICK ACTIONS SECTION */}
          <Box sx={{ mt: '32px', mb: '16px' }}>
            <Divider sx={{ border: '1px solid #E0E0E0', mb: '16px' }} />
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', mb: '8px' }}>
              ACCIONES
            </Typography>
            
            <List sx={{ p: 0 }}>
              <ListItem 
                button onClick={() => { onClose(); navigate(`/admin/reservations/view/${reservation.id}`); }}
                sx={{ height: 56, px: '8px', borderBottom: '1px solid #E0E0E0' }}
              >
                <span className="material-icons" style={{ color: '#70757A', fontSize: 20, marginRight: 16 }}>open_in_new</span>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124' }}>Ver detalles completos</Typography>
              </ListItem>
              
              <ListItem 
                button onClick={() => onEdit(reservation)}
                sx={{ height: 56, px: '8px', borderBottom: '1px solid #E0E0E0' }}
              >
                <span className="material-icons" style={{ color: '#70757A', fontSize: 20, marginRight: 16 }}>edit</span>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124' }}>Editar reserva</Typography>
              </ListItem>

              {currentStatus !== 'CANCELADA' && (
                <ListItem 
                  button onClick={() => handleStatusUpdate('CANCELADA')}
                  sx={{ height: 56, px: '8px' }}
                >
                  <span className="material-icons" style={{ color: '#D93025', fontSize: 20, marginRight: 16 }}>error_outline</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#D93025' }}>Cancelar reserva</Typography>
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </SwipeableDrawer>
      <ConfirmModal 
        open={confirmCancelOpen}
        title="Cancelar reserva"
        body={<>¿Seguro que deseas cancelar esta reserva?<br/>Esta acción no se puede deshacer.</>}
        confirmLabel={loading ? 'Guardando...' : 'CANCELAR RESERVA'}
        confirmColor="#D93025"
        confirmDisabled={loading}
        showInput={true}
        inputValue={cancelReason}
        onInputChange={setCancelReason}
        inputPlaceholder="Ej: Cierre por evento privado..."
        onCancel={() => {
          setConfirmCancelOpen(false);
          setCancelReason('');
        }}
        onConfirm={() => handleStatusUpdate('CANCELADA', cancelReason || null)}
      />
    </>
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
