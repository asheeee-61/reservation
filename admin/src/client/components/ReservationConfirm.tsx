import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Backdrop,
  Container,
  Paper,
  Divider,
  Grid,
  useMediaQuery,
  Slide,
  Fade
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  Group,
  Map as MapIcon,
  AutoAwesome,
  InfoOutlined,
  ArrowBackIosNew
} from '@mui/icons-material';
import { useToast } from '../../admin/components/Toast/ToastContext';
import { useReservationStore } from '../store/useReservationStore';
import { createReservation } from '../services/reservationService';

// --- TYPES ---

export interface UserData {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface ZoneData {
  id: number;
  name: string;
}

export interface CategoryData {
  id: number;
  name: string;
}

export interface ConfigData {
  business?: {
    name: string;
  };
}

export interface ReservationConfirmProps {
  onBack: () => void;
  onSuccess: (reservationId: string) => void;
  // Typed data props
  date: string | null;
  time: string | { time: string } | null;
  guests: number;
  zone: ZoneData | null;
  category: CategoryData | null;
  userData: UserData;
  config: ConfigData | null;
  // Actions
  onChangeUserData: (data: Partial<UserData>) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

// --- PRESENTATIONAL COMPONENT ---

function ReservationConfirmView(props: ReservationConfirmProps) {
  const {
    onBack,
    date,
    time,
    guests,
    zone,
    category,
    userData,
    config,
    onChangeUserData,
    onSubmit,
    submitting
  } = props;

  const isMobile = useMediaQuery('(max-width:600px)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasName = userData.name.trim().length > 0;
  const hasPhoneOrEmail = userData.email.trim().length > 0 || userData.phone.trim().length > 0;
  const validEmailIfPresent = userData.email.trim() === '' || isEmailValid(userData.email);
  const isValid = hasName && hasPhoneOrEmail && validEmailIfPresent;

  const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const displayTime = typeof time === 'string' ? time : (time?.time || '');

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'grey.50',
      position: 'relative',
      pb: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 4,
    }}>
      {/* Top Header with Back Button and Business Name */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
        px: 2
      }}>
          <IconButton
            onClick={onBack}
            sx={{ position: 'absolute', left: 8, color: 'text.primary', width: 48, height: 48 }}
            aria-label="Volver atrás"
          >
            <ArrowBackIosNew />
          </IconButton>
          <Typography variant="overline" color="primary" sx={{ fontSize: '12px' }}>
            {config?.business?.name || 'BUSINESS'}
          </Typography>
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 'bold' }}>
              Complete su reserva
            </Typography>
          </Box>

          {/* Reservation Summary Card */}
          <Fade in={mounted} style={{ transitionDelay: '100ms' }}>
            <Box>
              <Slide direction="up" in={mounted} style={{ transitionDelay: '100ms' }} easing="ease">
                <Paper
                  elevation={1}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: 'background.paper',
                    p: 3,
                    mb: 4,
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0'
                  }}
                >
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday color="primary" sx={{ mr: 2 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: '16px', textTransform: 'capitalize' }}>
                        {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule color="primary" sx={{ mr: 2 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                        {displayTime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Group color="primary" sx={{ mr: 2 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                        {guests} personas
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MapIcon color="primary" sx={{ mr: 2 }} />
                      <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                        {zone?.name || 'Cualquier zona'}
                      </Typography>
                    </Box>
                    {category && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AutoAwesome color="primary" sx={{ mr: 2 }} />
                        <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                          {category.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Slide>
            </Box>
          </Fade>

          {/* Contact Form Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
            Datos de contacto
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <TextField
              id="name-input"
              fullWidth
              label="Nombre completo"
              variant="outlined"
              required
              value={userData.name}
              onChange={(e) => onChangeUserData({ name: e.target.value })}
              autoComplete="name"
              inputMode="text"
              InputProps={{ sx: { fontSize: '16px' } }}
              InputLabelProps={{ sx: { fontSize: '16px' } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <TextField
                  id="email-input"
                  fullWidth
                  label="Correo electrónico"
                  variant="outlined"
                  type="email"
                  value={userData.email}
                  onChange={(e) => onChangeUserData({ email: e.target.value })}
                  error={userData.email.length > 0 && !isEmailValid(userData.email)}
                  autoComplete="email"
                  inputMode="email"
                  InputProps={{ sx: { fontSize: '16px' } }}
                  InputLabelProps={{ sx: { fontSize: '16px' } }}
                />
              </Box>
              <Box>
                <TextField
                  id="phone-input"
                  fullWidth
                  label="Teléfono (Preferiblemente WhatsApp)"
                  variant="outlined"
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => onChangeUserData({ phone: e.target.value })}
                  autoComplete="tel"
                  inputMode="tel"
                  InputProps={{ sx: { fontSize: '16px' } }}
                  InputLabelProps={{ sx: { fontSize: '16px' } }}
                />
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', mt: -1 }}>
              <InfoOutlined color="primary" sx={{ fontSize: 18, mr: 1 }} />
              Le enviaremos confirmación por email o WhatsApp
            </Typography>

            <TextField
              id="notes-input"
              fullWidth
              label="¿Algo más que debamos saber? (Opcional)"
              multiline
              rows={3}
              variant="outlined"
              value={userData.specialRequests}
              onChange={(e) => onChangeUserData({ specialRequests: e.target.value })}
              helperText="Por ejemplo: alergias alimentarias, necesidad de trona o detalles especiales para su evento."
              inputMode="text"
              InputProps={{ sx: { fontSize: '16px' } }}
              InputLabelProps={{ sx: { fontSize: '16px' } }}
            />
          </Box>

          {/* Desktop CTA Button */}
          {!isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 4 }}>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!isValid || submitting}
                sx={{
                  background: '#1A73E8',
                  color: '#FFFFFF',
                  px: 4,
                  py: 1.5,
                  borderRadius: '4px',
                  boxShadow: 'none',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    background: '#1557B0',
                    boxShadow: 'none'
                  },
                  '&.Mui-disabled': {
                    background: '#E0E0E0',
                    color: '#9E9E9E'
                  }
                }}
              >
                {submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'CONFIRMAR RESERVA'}
              </Button>
            </Box>
          )}

        </Container>

        {/* Mobile Sticky Bottom Bar */}
        {isMobile && (
          <Slide direction="up" in={mounted}>
            <Box sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              p: 2,
              pb: 'calc(16px + env(safe-area-inset-bottom))',
              zIndex: 100,
              boxShadow: '0px -4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', bgcolor: '#F5F5F5', px: 2, py: 0.5, borderRadius: '12px' }}>
                  {formattedDate} · {guests} personas
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={onSubmit}
                disabled={!isValid || submitting}
                sx={{
                  background: '#1A73E8',
                  color: '#FFFFFF',
                  py: 1.5,
                  borderRadius: '4px',
                  boxShadow: 'none',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    background: '#1557B0',
                    boxShadow: 'none',
                  },
                  '&.Mui-disabled': {
                    background: '#E0E0E0',
                    color: '#9E9E9E'
                  }
                }}
              >
                {submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'CONFIRMAR RESERVA'}
              </Button>
            </Box>
          </Slide>
        )}

        {/* Submitting Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: 1200, flexDirection: 'column', gap: 2, bgcolor: 'rgba(255, 255, 255, 0.8)' }}
          open={submitting}
        >
          <CircularProgress color="primary" />
          <Typography color="text.primary" sx={{ fontSize: '18px', fontWeight: 'medium' }}>
            Confirmando su reserva...
          </Typography>
        </Backdrop>

      </Box>
  );
}

// --- CONTAINER COMPONENT (DEFAULT EXPORT) ---

export default function ReservationConfirm({ onBack, onSuccess }: { onBack: () => void, onSuccess: (id: string) => void }) {
  const store = useReservationStore();
  const [submitting, setSubmitting] = useState(false);
  const toast: any = useToast();

  const {
    date, guests, selectedSlot, selectedZone, selectedEvent,
    userData, setUserData, config
  } = store;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        date,
        guests,
        slot: selectedSlot,
        user: userData,
        zone_id: selectedZone?.id,
        event_id: selectedEvent?.id
      };
      
      const res = await createReservation(payload) as any;
      
      if (res.success) {
        useReservationStore.setState({ reservationId: res.reservationId });
        toast.success("Reserva confirmada con éxito");
        onSuccess(res.reservationId);
      } else {
        toast.error(res.message || "Error al realizar la reserva.");
      }
    } catch (err: any) {
      toast.error(err.message || "Ha ocurrido un error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReservationConfirmView
      onBack={onBack}
      onSuccess={onSuccess}
      date={date}
      time={selectedSlot}
      guests={guests}
      zone={selectedZone}
      category={selectedEvent}
      userData={userData}
      config={config}
      onChangeUserData={(data) => setUserData({ ...userData, ...data })}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
