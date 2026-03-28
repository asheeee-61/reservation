import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Avatar, Button, CircularProgress,
  Snackbar, Divider, IconButton, Tooltip
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import TablePagination from '../components/TablePagination';

const STATUS_CHIP_STYLE = {
  'PENDIENTE':  { bg: '#FEF7E0', text: '#7D4A00', label: 'Pendiente' },
  'CONFIRMADA': { bg: '#E6F4EA', text: '#137333', label: 'Confirmada' },
  'ASISTIÓ':    { bg: '#E8F0FE', text: '#1A73E8', label: 'Asistió' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F', label: 'No asistió' },
  'CANCELADA':  { bg: '#FDECEA', text: '#C5221F', label: 'Cancelada' }
};

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) 
    return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0])
    .toUpperCase()
}

const formatMemberSince = (dateString) => {
  if (!dateString) return 'Fecha desconocida'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Fecha desconocida'
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  })
}

const formatLastVisit = (dateString) => {
  if (!dateString) return 'Sin visitas'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Sin visitas'
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTableDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '' });

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/admin/customers/${id}`);
      setCustomer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReservations = useCallback(async () => {
    setLoadingRes(true);
    try {
      const params = new URLSearchParams({ page, per_page: perPage });
      const data = await apiClient(`/admin/customers/${id}/reservations?${params.toString()}`);
      setReservations(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRes(false);
    }
  }, [id, page, perPage]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);
  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const stats = useMemo(() => {
    // Current code uses reservations from the first page only for these stats
    // But let's keep the logic consistent with what the user had if possible,
    // or use the customer.stats if provided.
    // The user rules say "keep existing, just move to TOP".
    // I will use the logic from the previous file but fix the labels/colors.
    
    if (!reservations || reservations.length === 0) {
      return { total: 0, noShows: 0, attendanceRate: 0, avgParty: 0 };
    }
    
    const total = meta?.total || reservations.length;
    
    // Note: These calculations are only on the current visible page.
    // Ideally the backend should provide these.
    // But since I'm fixing "layout and display", I'll stick to what was there.
    const noShows = reservations.filter(r => 
      ['NO_ASISTIÓ', 'CANCELADA', 'no_show', 'cancelled'].includes(r.status)
    ).length;
    
    const attended = reservations.filter(r =>
      ['CONFIRMADA', 'ASISTIÓ', 'confirmed', 'arrived'].includes(r.status)
    ).length;
    
    const attendanceRate = total > 0 ? Math.round((attended / reservations.length) * 100) : 0;
    
    const sumGuests = reservations.reduce((sum, r) => sum + (parseInt(r.guests) || 0), 0);
    const avgParty = reservations.length > 0 ? sumGuests / reservations.length : 0;
    
    return { total, noShows, attendanceRate, avgParty };
  }, [reservations, meta]);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!customer) return <Box display="flex" justifyContent="center" py={10}><Typography>Cliente no encontrado</Typography></Box>;

  const avgDisplay = Number.isInteger(stats.avgParty) 
    ? stats.avgParty.toString() 
    : stats.avgParty.toFixed(1);

  return (
    <Box sx={{ width: '100%', bgcolor: '#F1F3F4', minHeight: '100vh', p: '24px', boxSizing: 'border-box' }}>
      
      {/* ROW 1: BACK BUTTON */}
      <Box sx={{ mb: '24px' }}>
        <Button 
          startIcon={<span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>} 
          onClick={() => navigate('/admin/customers')} 
          sx={{ 
            color: '#1A73E8', textTransform: 'uppercase', fontFamily: '"Roboto", sans-serif', 
            fontWeight: 500, fontSize: '13px', p: 0, minWidth: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
          }}
        >
          VOLVER A CLIENTES
        </Button>
      </Box>

      {/* ROW 2: STATS ROW */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
        gap: '16px', 
        mb: '24px' 
      }}>
        {[
          { icon: 'calendar_today', value: stats.total, label: 'Total reservas', color: '#1A73E8' },
          { icon: 'event_busy', value: stats.noShows, label: 'No asistencias', color: stats.noShows > 0 ? '#D93025' : '#202124' },
          { icon: 'people', value: `${stats.attendanceRate}%`, label: 'Tasa de asistencia', 
            valColor: stats.attendanceRate >= 80 ? '#137333' : (stats.attendanceRate >= 50 ? '#F9AB00' : '#D93025') },
          { icon: 'group', value: avgDisplay, label: 'Promedio de personas', color: '#1A73E8' }
        ].map((s, i) => (
          <Paper key={i} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', p: '20px', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="material-icons" style={{ fontSize: 24, color: s.color || '#70757A' }}>{s.icon}</span>
            <Box>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: s.valColor || '#202124', lineHeight: 1.2 }}>{s.value}</Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', whiteSpace: 'nowrap' }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ROW 3: TWO COLUMNS */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '24px' }}>
        
        {/* LEFT COLUMN: CUSTOMER INFO CARD */}
        <Paper sx={{ width: { xs: '100%', md: '320px' }, height: 'fit-content', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', p: '24px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: '20px' }}>
            <Avatar sx={{ bgcolor: '#1A73E8', color: '#FFFFFF', width: 72, height: 72, fontSize: '28px', fontFamily: 'Roboto', fontWeight: 500 }}>
              {getInitials(customer.name)}
            </Avatar>
            <Typography sx={{ mt: '12px', fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124', textAlign: 'center' }}>
              {customer.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>mail_outline</span>
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: customer.email ? '#202124' : '#BDBDBD', fontStyle: customer.email ? 'normal' : 'italic' }}>
                  {customer.email || 'Sin correo'}
                </Typography>
              </Box>
              {customer.email && (
                <Tooltip title="Enviar correo">
                  <IconButton 
                    size="small" 
                    component="a" 
                    href={`mailto:${customer.email}`}
                    sx={{ color: '#1A73E8', p: '4px' }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>send</span>
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>phone</span>
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: customer.phone ? '#202124' : '#BDBDBD', fontStyle: customer.phone ? 'normal' : 'italic' }}>
                  {customer.phone || 'Sin teléfono'}
                </Typography>
              </Box>
              {customer.phone && (
                <Tooltip title="Enviar WhatsApp">
                  <IconButton 
                    size="small" 
                    component="a" 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    sx={{ color: '#137333', p: '4px' }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>chat</span>
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
              <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>calendar_today</span>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>
                Miembro desde {formatMemberSince(customer.created_at)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: '20px', borderColor: '#E0E0E0' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
              {formatLastVisit(customer.stats?.last_visit)}
            </Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A' }}>
              Última visita
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT COLUMN: RESERVATION HISTORY CARD */}
        <Paper sx={{ flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ px: '24px', py: '20px', borderBottom: '1px solid #E0E0E0' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
              Historial de reservas
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F1F3F4' }}>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', fontSize: '12px', borderBottom: '1px solid #E0E0E0' }}>FECHA</TableCell>
                  <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', fontSize: '12px', borderBottom: '1px solid #E0E0E0' }}>HORA</TableCell>
                  <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', fontSize: '12px', borderBottom: '1px solid #E0E0E0' }}>PERSONAS</TableCell>
                  <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', fontSize: '12px', borderBottom: '1px solid #E0E0E0' }}>TIPO DE MESA</TableCell>
                  <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#70757A', fontSize: '12px', borderBottom: '1px solid #E0E0E0' }}>ESTADO</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingRes ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: '40px' }}>
                      <span className="material-icons" style={{ fontSize: 32, color: '#BDBDBD', marginBottom: '8px', display: 'block' }}>calendar_today</span>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>Sin historial de reservas</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map(r => {
                    const status = STATUS_CHIP_STYLE[r.status] || { bg: '#F1F3F4', text: '#5F6368', label: r.status };
                    return (
                      <TableRow 
                        key={r.id} 
                        hover 
                        onClick={() => navigate(`/admin/reservations/view/${r.id}`)} 
                        sx={{ cursor: 'pointer', height: '52px', '&:hover': { bgcolor: '#F1F3F4' } }}
                      >
                        <TableCell sx={{ fontSize: '14px', fontFamily: 'Roboto', color: '#202124' }}>
                          {formatTableDate(r.date)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', fontFamily: 'Roboto', color: '#70757A' }}>
                          {r.time}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', fontFamily: 'Roboto', color: '#202124' }}>
                          {r.guests}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', fontFamily: 'Roboto', color: '#202124' }}>
                          {r.table_type?.name || '—'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'inline-block', bgcolor: status.bg, color: status.text, 
                            px: '8px', py: '4px', borderRadius: '4px', 
                            fontSize: '12px', fontFamily: 'Roboto', fontWeight: 500,
                            textTransform: 'uppercase'
                          }}>
                            {status.label}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
          
          {meta && meta.last_page > 1 && (
            <Box sx={{ borderTop: '1px solid #E0E0E0' }}>
              <TablePagination
                meta={meta}
                page={page}
                perPage={perPage}
                onPageChange={(p) => setPage(p)}
                onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
      />
    </Box>
  );
}
