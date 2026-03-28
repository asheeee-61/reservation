import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Box, Typography, IconButton, Paper, 
  Fade, Drawer, useMediaQuery, useTheme 
} from '@mui/material';
import { formatDateISO } from '../../../utils/time';

/**
 * MD2 Custom Date Picker
 * Desktop: Inline dropdown with transition.
 * Mobile: Full-width bottom sheet with overlay.
 */
export default function DatePicker({ value, onChange, label, blockedDays = [] }) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
  const containerRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (value) setCurrentDate(new Date(value));
  }, [value]);

  const handleToggle = () => setOpen(!open);
  const handleClose = () => { setOpen(false); setViewMode('month'); };

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0,0,0,0);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNamesShort = ["L", "M", "X", "J", "V", "S", "D"];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);
    const prevMonthDays = daysInMonth(year, month - 1);
    
    const arr = [];
    // Prev month days
    for (let i = startDay - 1; i >= 0; i--) {
        arr.push({ day: prevMonthDays - i, month: month - 1, year, currentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysCount; i++) {
        arr.push({ day: i, month: month, year, currentMonth: true });
    }
    // Next month days
    const totalSlots = 42; 
    const nextDays = totalSlots - arr.length;
    for (let i = 1; i <= nextDays; i++) {
        arr.push({ day: i, month: month + 1, year, currentMonth: false });
    }
    return arr;
  }, [currentDate]);

  const handlePrev = (e) => { e.stopPropagation(); setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); };
  const handleNext = (e) => { e.stopPropagation(); setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); };

  const handleDateClick = (dayObj) => {
    const d = new Date(dayObj.year, dayObj.month, dayObj.day);
    if (d < today) return;
    const iso = formatDateISO(d);
    if (blockedDays.includes(iso)) return;
    
    onChange(iso);
    handleClose();
  };

  const renderCalendarGrid = () => (
    <Box sx={{ p: 2, minWidth: isMobile ? '100%' : 300 }}>
       {/* Calendar Header */}
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, mb: 1 }}>
         <IconButton onClick={handlePrev} sx={{ width: 40, height: 40, borderRadius: '4px', '&:hover': { bgcolor: '#F1F3F4' } }}>
            <span className="material-icons" style={{ color: '#70757A', fontSize: 24 }}>chevron_left</span>
         </IconButton>
         
         <Typography 
           onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
           sx={{ 
             fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124',
             cursor: 'pointer', '&:hover': { color: '#1A73E8' } 
           }}
         >
           {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
         </Typography>

         <IconButton onClick={handleNext} sx={{ width: 40, height: 40, borderRadius: '4px', '&:hover': { bgcolor: '#F1F3F4' } }}>
            <span className="material-icons" style={{ color: '#70757A', fontSize: 24 }}>chevron_right</span>
         </IconButton>
       </Box>

       {viewMode === 'month' ? (
         <>
           {/* Day Headers */}
           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
              {dayNamesShort.map(d => (
                <Typography key={d} sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textAlign: 'center' }}>
                  {d}
                </Typography>
              ))}
           </Box>
           
           {/* Grid */}
           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {calendarDays.map((d, i) => {
                const dateObj = new Date(d.year, d.month, d.day);
                const iso = formatDateISO(dateObj);
                const isSelected = value === iso;
                const isTodayDate = dateObj.getTime() === today.getTime();
                const isBlocked = blockedDays.includes(iso);
                const isPast = dateObj < today;
                const isAvailable = !isPast && !isBlocked;

                return (
                  <Box 
                    key={i} 
                    onClick={() => isAvailable && handleDateClick(d)}
                    sx={{ 
                      width: isMobile ? 48 : 40, 
                      height: isMobile ? 48 : 40, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: isAvailable ? 'pointer' : 'default',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ 
                      width: isMobile ? 40 : 36, 
                      height: isMobile ? 40 : 36, 
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isSelected ? '#1A73E8' : 'transparent',
                      border: isTodayDate && !isSelected ? '1px solid #1A73E8' : 'none',
                      color: isSelected ? '#FFFFFF' : (isTodayDate ? '#1A73E8' : (isAvailable && d.currentMonth ? '#202124' : '#BDBDBD')),
                      fontFamily: 'Roboto', fontSize: '14px',
                      '&:hover': { 
                        bgcolor: isAvailable && !isSelected ? '#F1F3F4' : (isSelected ? '#1A73E8' : 'transparent') 
                      }
                    }}>
                      {d.day}
                    </Box>
                    {isBlocked && (
                        <Box sx={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: '50%', bgcolor: '#D93025' }} />
                    )}
                  </Box>
                );
              })}
           </Box>
         </>
       ) : (
         /* Year View Placeholder (simplified) */
         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, maxHeight: 280, overflowY: 'auto', p: 1 }}>
            {[...Array(20)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                const isActive = currentDate.getFullYear() === year;
                return (
                    <Box 
                      key={year}
                      onClick={() => { setCurrentDate(new Date(year, currentDate.getMonth(), 1)); setViewMode('month'); }}
                      sx={{ 
                        p: 1.5, textAlign: 'center', borderRadius: '4px', cursor: 'pointer',
                        bgcolor: isActive ? '#E8F0FE' : 'transparent',
                        color: isActive ? '#1A73E8' : '#202124',
                        fontFamily: 'Roboto', fontWeight: isActive ? 500 : 400,
                        '&:hover': { bgcolor: '#F1F3F4' }
                      }}
                    >
                        {year}
                    </Box>
                )
            })}
         </Box>
       )}
    </Box>
  );

  // Format value for display
  const displayValue = useMemo(() => {
    if (!value) return '';
    const d = new Date(value);
    const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    let str = d.toLocaleDateString('es-ES', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [value]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
        <Box 
          onClick={handleToggle}
          sx={{ 
            height: 56, border: '1px solid #DADCE0', borderRadius: '4px', p: '0 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'border-color 200ms',
            '&:hover': { borderColor: '#1A73E8' },
            position: 'relative'
          }}
        >
            <Typography sx={{ 
                position: 'absolute', top: -8, left: 12, bgcolor: '#FFFFFF', px: 0.5,
                fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A'
            }}>
                {label}
            </Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontSize: '16px', color: value ? '#202124' : '#BDBDBD' }}>
                {displayValue || 'Seleccionar fecha'}
            </Typography>
            <span className="material-icons" style={{ color: '#70757A', fontSize: 20 }}>calendar_today</span>
        </Box>

        {isMobile ? (
            <Drawer
              anchor="bottom"
              open={open}
              onClose={handleClose}
              PaperProps={{ 
                  sx: { 
                      borderRadius: '16px 16px 0 0', 
                      maxHeight: '90vh',
                      pb: 4
                  } 
              }}
            >
                <Box sx={{ width: 40, height: 4, bgcolor: '#E0E0E0', borderRadius: '2px', mx: 'auto', mt: 1.5, mb: 1 }} />
                {renderCalendarGrid()}
            </Drawer>
        ) : (
            <Fade in={open}>
                <Paper sx={{ 
                    position: 'absolute', top: 60, left: 0, zIndex: 1000, 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', border: '1px solid #E0E0E0'
                }}>
                    {renderCalendarGrid()}
                </Paper>
            </Fade>
        )}
        
        {/* Overlay for desktop outside click */}
        {open && !isMobile && (
            <Box 
              onClick={handleClose}
              sx={{ position: 'fixed', inset: 0, zIndex: 999, bgcolor: 'transparent' }} 
            />
        )}
    </Box>
  );
}
