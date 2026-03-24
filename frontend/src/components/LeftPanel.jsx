import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, Typography, MenuItem, Select, FormControl,
  InputAdornment, Button, Grid, CircularProgress, Divider, Skeleton
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { useReservationStore } from '../store/useReservationStore';
import { getAvailableSlots } from '../services/reservationService';

const formatDateLabel = (dateString) => {
  if (!dateString) return '';
  const selectedDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  if (selectedDate.toDateString() === today.toDateString()) return "Today";
  if (selectedDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  
  return selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function LeftPanel({ onContinue }) {
  const { date, guests, selectedSlot, config, setDate, setGuests, setSelectedSlot } = useReservationStore();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const dateInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (!config) return;
    
    setLoading(true);
    getAvailableSlots(date, guests)
      .then(res => {
        if (active) {
          setSlots(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [date, guests, config]);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  if (!config) return <Box p={4}><CircularProgress /></Box>;
  
  const guestsOptions = [];
  for (let i = config.minGuests; i <= config.maxGuests; i++) guestsOptions.push(i);

  return (
    <Box sx={{ 
      p: { xs: 2.5, md: 4 }, 
      display: 'flex', flexDirection: 'column', gap: 3, 
      height: '100%',
      bgcolor: 'background.paper',
      boxShadow: { xs: 'none', md: '2px 0 8px rgba(0,0,0,0.05)' },
      zIndex: 1,
      overflowY: 'auto'
    }}>
      <Box sx={{ mt: { md: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {config.restaurant.name || 'Make a Reservation'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select your party size, date, and time.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 140, flexGrow: 1 }}>
          <Select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            startAdornment={<InputAdornment position="start"><PeopleIcon fontSize="small" /></InputAdornment>}
            renderValue={(val) => `${val} ${val === 1 ? 'Guest' : 'Guests'}`}
            sx={{ 
              borderRadius: 2, 
              bgcolor: 'background.default',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
            }}
          >
            {guestsOptions.map(num => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ minWidth: 140, flexGrow: 1, position: 'relative' }}>
          <Button
            variant="outlined"
            onClick={handleDateClick}
            startIcon={<CalendarTodayIcon fontSize="small" color="action" />}
            sx={{ 
              width: '100%', 
              height: '56px',
              justifyContent: 'flex-start',
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.default',
              borderRadius: 2,
              pl: 2,
              py: 0,
              fontSize: '1rem',
              fontWeight: 400,
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: 'background.default',
              }
            }}
          >
            {formatDateLabel(date)}
          </Button>
          <input 
            type="date"
            ref={dateInputRef}
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, border: 0, padding: 0, overflow: 'hidden' }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Available Times
        </Typography>
        
        {loading ? (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1.5}>
              {[1,2,3,4,5,6].map(i => <Grid item xs={4} sm={3} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 2 }} />
              </Grid>)}
            </Grid>
          </Box>
        ) : slots.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">No slots available for this date.</Typography>
        ) : (
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            {slots.map((slot, sIdx) => {
              const isSelected = selectedSlot?.time === slot.time;
              return (
                <Grid item xs={4} sm={3} md={4} lg={3} key={sIdx}>
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    color={isSelected ? "primary" : "inherit"}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot({ time: slot.time })}
                    sx={{ 
                      borderRadius: 2, 
                      py: 1,
                      fontWeight: 500,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      color: isSelected ? 'white' : 'text.primary',
                      bgcolor: isSelected ? 'primary.main' : 'white',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                        borderColor: isSelected ? 'primary.dark' : 'grey.300'
                      }
                    }}
                  >
                    {slot.time}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Sticky Bottom Bar for Continue */}
      <Box sx={{ mt: 'auto', pt: 3, pb: { xs: 2, md: 0 } }}>
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          disabled={!selectedSlot}
          onClick={onContinue}
          disableElevation
          sx={{ borderRadius: 2, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
