import { useState, useEffect } from 'react';
import { Typography, Box, Paper, Button, Dialog, Tooltip, Stack, Divider, IconButton, Select, MenuItem, FormControl, CircularProgress } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../../shared/api';
import CustomerAvatar from '../components/CustomerAvatar';
import SourceBadge from '../components/SourceBadge';
import { useToast } from '../components/Toast/ToastContext';
import { PageHeaderSkeleton, CardSkeleton } from '../components/Skeletons';
import { BackButton } from '../components/BackButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

const STATUS_COLORS = {
  'PENDIENTE': { bg: '#FEF7E0', text: '#7D4A00' },
  'CONFIRMADA': { bg: '#E8F0FE', text: '#1A73E8' },
  'ASISTIÓ': { bg: '#E6F4EA', text: '#137333' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F' },
  'CANCELADA': { bg: '#F1F3F4', text: '#5F6368' }
};

const STATUS_LABELS = {
  'PENDIENTE': 'Pendiente',
  'CONFIRMADA': 'Confirmada',
  'ASISTIÓ': 'Asistió',
  'NO_ASISTIÓ': 'No asistió',
  'CANCELADA': 'Cancelada'
};

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} · ${hours}:${minutes}`;
};

export default function ViewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [resData, setResData] = useState(location.state?.reservation || null);
  const [loading, setLoading] = useState(!location.state?.reservation);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const toast = useToast();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await apiClient(`/admin/reservations/${id}`);
        setResData(data);
        if (data.activities) {
          setActivities(data.activities.map(a => ({
            id: a.id,
            text: a.description,
            time: a.created_at
          })));
        }
      } catch (e) {
        console.error('Failed to fetch reservation:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);


  const handleStatusUpdate = async (newStatus, reason = null) => {
    if (newStatus === 'CANCELADA' && !reason) {
      setCancelModalOpen(true);
      return;
    }

    setStatusLoading(true);
    try {
      const response = await apiClient(`/admin/reservations/${resData.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: newStatus,
          cancellation_reason: reason
        })
      });
      
      setResData(response.data);
      toast.success('Estado actualizado');
      if (response.data.activities) {
        setActivities(response.data.activities.map(a => ({
          id: a.id,
          text: a.description,
          time: a.created_at
        })));
      }
    } catch (e) {
      toast.error('Error al actualizar el estado');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelClick = async () => {
    setCancelLoading(true);
    try {
      await handleStatusUpdate('CANCELADA', cancelReason || null);
      setCancelModalOpen(false);
      setCancelReason('');
    } catch (e) {
      // Error handled in handleStatusUpdate
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <PageHeaderSkeleton />
        <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
          <Box flex={1}><CardSkeleton /></Box>
        </Box>
      </Box>
    );
  }

  if (!resData) {
    return (
      <Box p={3}>
        <BackButton fallback="/admin/reservations" />
        <EmptyState 
          icon="event_busy" 
          title="Reserva no encontrada" 
          message="La reserva solicitada no existe o fue eliminada." 
        />
      </Box>
    );
  }

  const currentStatus = resData.status?.toUpperCase() || 'PENDIENTE';
  const statusColors = STATUS_COLORS[currentStatus] || { bg: '#F1F3F4', text: '#202124' };

  return (
    <Box sx={{ width: '100%', bgcolor: '#F1F3F4', minHeight: '100vh', boxSizing: 'border-box' }}>
      <Box sx={{ width: '100%', p: { xs: '16px', md: '24px' }, boxSizing: 'border-box' }}>
        
        {/* TOP BAR */}
        <Box sx={{ mb: '24px' }}>
          <BackButton fallback="/admin/reservations" />
        </Box>

        {/* TWO COLUMN LAYOUT */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '24px' }}>
          
          {/* MAIN CARD (flex: 1) */}
          <Paper sx={{ flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
            
            {/* Card Header */}
            <Box sx={{ px: { xs: '16px', md: '24px' }, py: '20px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: { xs: '18px', md: '20px' }, color: '#202124', flexGrow: 1 }}>
                Reserva #{resData.reservation_id || id}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button 
                  variant="outlined"
                  onClick={() => navigate(`/admin/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
                  disabled={!resData.id}
                  sx={{ 
                    height: 36, 
                    borderRadius: '4px', 
                    border: '1px solid #DADCE0', 
                    color: '#70757A', 
                    fontFamily: 'Roboto', 
                    fontWeight: 500, 
                    fontSize: '13px', 
                    textTransform: 'uppercase', 
                    px: '16px', 
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
                    '&.Mui-disabled': { color: '#BDBDBD', border: '1px solid #E0E0E0' }
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16, marginRight: 8 }}>edit</span>
                  Editar
                </Button>

                <FormControl size="small" variant="standard" sx={{ minWidth: 140, position: 'relative' }}>
                  <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={statusLoading}
                    disableUnderline
                    sx={{ 
                      '& .MuiSelect-select': { 
                        py: '6px', px: '16px', 
                        borderRadius: '4px',
                        bgcolor: statusColors.bg,
                        color: statusColors.text,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'Roboto',
                        textTransform: 'uppercase',
                        opacity: statusLoading ? 0.7 : 1
                      },
                      '& .MuiSvgIcon-root': { color: statusColors.text }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 0.5,
                          border: '1px solid #DADCE0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          '& .MuiMenuItem-root': {
                            fontFamily: 'Roboto',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            '&:hover': { bgcolor: '#F1F3F4' },
                            '&.Mui-selected': { bgcolor: '#E8F0FE' }
                          }
                        }
                      }
                    }}
                  >
                    {Object.keys(STATUS_COLORS).map(s => (
                      <MenuItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </MenuItem>
                    ))}
                  </Select>
                  {statusLoading && (
                    <Box sx={{ position: 'absolute', right: -25, top: 4 }}>
                      <CircularProgress size={16} sx={{ color: statusColors.text }} />
                    </Box>
                  )}
                </FormControl>
              </Stack>
            </Box>

            {/* Card Body */}
            <Box sx={{ p: { xs: '16px', md: '24px' } }}>
              
              {/* Section 1 - Detalles */}
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '16px' }}>
                DETALLES DE LA RESERVA
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '0' }}>
                <Box sx={{ pb: '20px', borderBottom: '1px solid #E0E0E0', pr: { md: '12px' } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>FECHA Y HORA</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.date || 'N/A'} · {resData.time || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ pb: '20px', borderBottom: '1px solid #E0E0E0', pl: { md: '12px' }, pt: { xs: '20px', md: 0 } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>PERSONAS</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.guests || 0} personas
                  </Typography>
                </Box>
                
                <Box sx={{ pb: 0, pt: '20px', pr: { md: '12px' } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>EVENTO</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>{resData.event?.name || 'Sin evento asignado'}</Typography>
                </Box>
                <Box sx={{ pb: 0, pt: '20px', pl: { md: '12px' } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>ZONA</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.zone?.name || 'Sin zona asignada'}
                  </Typography>
                </Box>
              </Box>

              {/* Section 2 - Notas especiales */}
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mt: { xs: '24px', md: '32px' }, mb: '16px' }}>
                NOTAS ESPECIALES
              </Typography>
              <Box sx={{ bgcolor: '#F8F9FA', borderRadius: '4px', p: '12px' }}>
                {resData.special_requests ? (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {resData.special_requests}
                  </Typography>
                ) : (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', fontStyle: 'italic' }}>
                    Sin notas especiales
                  </Typography>
                )}
              </Box>

              <Box sx={{ borderTop: '1px solid #E0E0E0', pt: '16px', mt: '24px', display: { xs: 'block', md: 'none' } }}>
                  <Button 
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/admin/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
                    disabled={!resData.id}
                    sx={{ 
                      height: 44, 
                      borderRadius: '4px', 
                      bgcolor: '#1A73E8', 
                      color: '#FFFFFF', 
                      fontFamily: 'Roboto', 
                      fontWeight: 500, 
                      fontSize: '13px', 
                      textTransform: 'uppercase', 
                      boxShadow: 'none', 
                      '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' },
                      '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#BDBDBD' }
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16, marginRight: 8 }}>edit</span>
                    EDITAR RESERVA
                  </Button>
              </Box>

            </Box>
          </Paper>

          {/* SIDE CARD (320px) */}
          <Paper sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', alignSelf: 'flex-start' }}>
            
            {/* Section 1 - Cliente */}
            <Typography sx={{ px: '20px', py: '16px', borderBottom: '1px solid #E0E0E0', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Cliente
            </Typography>
            <Box sx={{ p: '20px' }}>
              {resData.customer?.name ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CustomerAvatar 
                      name={resData.customer.name} 
                      counts={{
                        total: resData.customer.reservations_count,
                        arrived: resData.customer.arrived_count,
                        noShow: resData.customer.no_show_count
                      }}
                      size={40}
                      onClick={() => navigate(`/admin/customers/${resData.customer.id}`)}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        onClick={() => navigate(`/admin/customers/${resData.customer.id}`)}
                        sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#1A73E8', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {resData.customer.name}
                      </Typography>
                      {resData.customer.email && (
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>{resData.customer.email}</Typography>
                      )}
                      {resData.customer.phone && (
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>{resData.customer.phone}</Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Communication Actions */}
                  <Stack direction="row" spacing={1} sx={{ mt: '20px' }}>
                    {/* WHATSAPP */}
                    {(() => {
                      const phone = resData.customer?.phone?.replace(/\D/g, '');
                      const isEnabled = phone && phone.length > 0;
                      return (
                        <IconButton 
                          disabled={!isEnabled}
                          onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
                          sx={{ 
                            width: 32, height: 32, borderRadius: '4px', 
                            border: isEnabled ? '1px solid #DADCE0' : '1px solid #E0E0E0', 
                            bgcolor: isEnabled ? '#FFFFFF' : 'transparent', 
                            color: isEnabled ? '#70757A' : '#BDBDBD',
                            cursor: isEnabled ? 'pointer' : 'not-allowed',
                            '&:hover': isEnabled ? { bgcolor: '#F1F3F4' } : { bgcolor: 'transparent' },
                            '&.Mui-disabled': { color: '#BDBDBD', border: '1px solid #E0E0E0' }
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 18 }}>chat</span>
                        </IconButton>
                      );
                    })()}

                    {/* EMAIL */}
                    {(() => {
                      const email = resData.customer?.email;
                      const isEnabled = email && email.length > 0;
                      return (
                        <IconButton 
                          disabled={!isEnabled}
                          onClick={() => window.location.href = `mailto:${email}`}
                          sx={{ 
                            width: 32, height: 32, borderRadius: '4px', 
                            border: isEnabled ? '1px solid #DADCE0' : '1px solid #E0E0E0', 
                            bgcolor: isEnabled ? '#FFFFFF' : 'transparent', 
                            color: isEnabled ? '#70757A' : '#BDBDBD',
                            cursor: isEnabled ? 'pointer' : 'not-allowed',
                            '&:hover': isEnabled ? { bgcolor: '#F1F3F4' } : { bgcolor: 'transparent' },
                            '&.Mui-disabled': { color: '#BDBDBD', border: '1px solid #E0E0E0' }
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 18 }}>mail</span>
                        </IconButton>
                      );
                    })()}
                  </Stack>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="material-icons" style={{ fontSize: 32, color: '#BDBDBD' }}>person_off</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mt: '8px', textAlign: 'center' }}>Sin cliente asignado</Typography>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/admin/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
                    sx={{ mt: '12px', width: { xs: '100%', md: 'auto' }, height: { xs: 44, md: 36 }, borderRadius: '4px', borderColor: '#1A73E8', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', px: '16px' }}
                  >
                    Asignar Cliente
                  </Button>
                </Box>
              )}
            </Box>

            {/* Section 1.5 - Origen */}
            <Box sx={{ px: '20px', pt: '16px', pb: '16px', borderTop: '1px solid #E0E0E0' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '8px' }}>
                Origen de la reserva
              </Typography>
                  <SourceBadge source={resData.source} />
            </Box>

            {/* Section 2 - Historial */}
            <Typography sx={{ px: '20px', py: '16px', borderTop: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Actividad
            </Typography>
            <Box sx={{ p: '16px' }}>
              {activities.length > 0 ? (
                <Box sx={{ position: 'relative', pl: '16px' }}>
                  <Box sx={{ position: 'absolute', left: 3, top: 4, bottom: 4, width: '1px', bgcolor: '#E0E0E0' }} />
                  {activities.map((act, i) => (
                    <Box key={act.id}>
                      <Box sx={{ position: 'relative', mb: '12px', pl: '12px' }}>
                        <Box sx={{ position: 'absolute', left: '-16px', top: '5px', width: 8, height: 8, borderRadius: '50%', bgcolor: '#1A73E8' }} />
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#202124' }}>{act.text}</Typography>
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '2px' }}>{formatTimestamp(act.time)}</Typography>
                      </Box>
                      {i < activities.length - 1 && <Divider sx={{ my: '12px', ml: '-16px', borderColor: '#E0E0E0' }} />}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>Sin actividad registrada</Typography>
              )}
            </Box>

          </Paper>
        </Box>
      </Box>
      <ConfirmModal 
        open={cancelModalOpen}
        title="Cancelar reserva"
        body={`¿Seguro que deseas cancelar la reserva #${resData.reservation_id || id}? Esta acción no se puede deshacer.`}
        confirmLabel="Cancelar Reserva"
        confirmColor="#D93025"
        confirmDisabled={cancelLoading}
        showInput={true}
        inputValue={cancelReason}
        onInputChange={setCancelReason}
        inputPlaceholder="Motivo (opcional — se enviará al cliente)"
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason('');
        }}
        onConfirm={handleCancelClick}
      />
    </Box>
  );
}
