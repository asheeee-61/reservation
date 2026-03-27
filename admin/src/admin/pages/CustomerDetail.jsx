import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Avatar, Button, Tooltip, CircularProgress,
  MenuItem, Select, FormControl, Snackbar
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';
import TablePagination from '../components/TablePagination';

const STATUS_CHIP = {
  'PENDIENTE':  { bg: '#FEF7E0', text: '#7D4A00', label: 'Pendiente' },
  'CONFIRMADA': { bg: '#E8F0FE', text: '#1A73E8', label: 'Confirmada' },
  'ASISTIÓ':    { bg: '#E6F4EA', text: '#137333', label: 'Asistió' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F', label: 'No asistió' },
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reservations list state
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);
  const [filter, setFilter] = useState('ALL');

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
      if (filter !== 'ALL') params.append('filter', filter);
      const data = await apiClient(`/admin/customers/${id}/reservations?${params.toString()}`);
      setReservations(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRes(true); // Wait, should be false
      setLoadingRes(false);
    }
  }, [id, page, perPage, filter]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);
  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleStatusUpdate = async (resId, newStatus) => {
    try {
      await apiClient(`/admin/reservations/${resId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setToast({ open: true, message: 'Estado actualizado correctamente' });
      fetchReservations(); // Refresh list to get updated status and potentially stats (though stats are on customer fetch)
      fetchCustomer();     // Refresh stats
    } catch (e) {
      console.error('Update status failed', e);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const sanitizePhone = (phone) => phone?.replace(/[\s+]/g, '').replace(/\D/g, '') || '';

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!customer) return <Box display="flex" justifyContent="center" py={10}><Typography>Customer not found</Typography></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', [MOBILE]: { flexDirection: 'column', alignItems: 'flex-start', gap: '16px' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Avatar sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', width: 64, height: 64, fontSize: '24px', fontFamily: 'Roboto', fontWeight: 500 }}>
              {getInitials(customer.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124' }}>
                {customer.name}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>
                {customer.email}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124', mt: '2px' }}>
                {customer.phone}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outlined"
              disabled={!customer.phone}
              startIcon={<span className="material-icons">chat</span>}
              onClick={() => window.open(`https://wa.me/${sanitizePhone(customer.phone)}`, '_blank')}
              sx={{ textTransform: 'none', fontFamily: 'Roboto', borderColor: '#DADCE0', color: '#1A73E8' }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              disabled={!customer.email}
              startIcon={<span className="material-icons">mail</span>}
              onClick={() => window.location.href = `mailto:${customer.email}`}
              sx={{ textTransform: 'none', fontFamily: 'Roboto', borderColor: '#DADCE0', color: '#1A73E8' }}
            >
              Email
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* STATS STRIP */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
        gap: '16px' 
      }}>
        {[
          { label: 'Total reservas', value: customer.stats.total_reservations, icon: 'event' },
          { label: 'Última visita', value: customer.stats.last_visit || 'N/A', icon: 'history' },
          { label: 'No shows', value: customer.stats.no_shows, icon: 'event_busy', color: '#D93025' },
          { label: 'Asistencia', value: `${customer.stats.attendance_ratio}%`, icon: 'check_circle', color: '#137333' }
        ].map((s, i) => (
          <Paper key={i} sx={{ p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '4px' }}>
              <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>{s.icon}</span>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: s.color || '#202124' }}>
              {s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* RESERVATIONS HISTORY */}
      <Paper sx={{ borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', overflow: 'hidden' }}>
        <Box sx={{ px: '24px', py: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0' }}>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px' }}>
            Historial de reservas
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CONFIRMADA', 'NO_SHOW'].map(f => (
              <Button
                key={f}
                size="small"
                onClick={() => { setFilter(f); setPage(1); }}
                sx={{ 
                  textTransform: 'none', px: '12px', borderRadius: '16px', fontSize: '12px',
                  bgcolor: filter === f ? '#E8F0FE' : 'transparent',
                  color: filter === f ? '#1A73E8' : '#70757A',
                  '&:hover': { bgcolor: filter === f ? '#E8F0FE' : '#F1F3F4' }
                }}
              >
                {f === 'ALL' ? 'Todas' : f === 'CONFIRMADA' ? 'Confirmadas' : 'No shows'}
              </Button>
            ))}
          </Box>
        </Box>

        <Table>
          <TableHead sx={{ bgcolor: '#F1F3F4' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Pax</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Mesa / Evento</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingRes && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>}
            {!loadingRes && reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary" sx={{ fontFamily: 'Roboto' }}>Este cliente aún no tiene reservas.</Typography>
                </TableCell>
              </TableRow>
            )}
            {reservations.map(r => {
              const chip = STATUS_CHIP[r.status] || { bg: '#F1F3F4', text: '#202124', label: r.status };
              return (
                <TableRow key={r.id} hover onClick={() => navigate(`/admin/reservations/view/${r.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500 }}>{r.date}</Typography>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{r.time}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>{r.guests}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>{r.table_type?.name || 'Standard'}</Typography>
                    {r.special_event && (
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#1A73E8' }}>{r.special_event.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <FormControl size="small" variant="standard" sx={{ m: 0 }}>
                      <Select
                        value={r.status}
                        onChange={(e) => handleStatusUpdate(r.id, e.target.value)}
                        disableUnderline
                        sx={{
                          bgcolor: chip.bg, color: chip.text, borderRadius: '4px', px: '8px',
                          fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px',
                          '& .MuiSelect-select': { py: '4px', pr: '24px !important', textTransform: 'uppercase' },
                          '& .MuiSvgIcon-root': { color: chip.text, right: 0 }
                        }}
                      >
                        {Object.keys(STATUS_CHIP).map(k => (
                          <MenuItem key={k} value={k} sx={{ fontFamily: 'Roboto', fontSize: '13px', textTransform: 'uppercase' }}>
                            {STATUS_CHIP[k].label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Detail">
                        <Box
                          onClick={() => navigate(`/admin/reservations/view/${r.id}`)}
                          sx={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: '4px', cursor: 'pointer',
                            border: '1px solid #DADCE0', color: '#70757A',
                            '&:hover': { bgcolor: '#F1F3F4' },
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 18 }}>visibility</span>
                        </Box>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {meta && reservations.length > 0 && (
          <TablePagination
            meta={meta}
            page={page}
            perPage={perPage}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        )}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
      />
    </Box>
  );
}
