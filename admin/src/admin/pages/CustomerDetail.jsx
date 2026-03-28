import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Avatar, Button, CircularProgress,
  MenuItem, Select, FormControl, Snackbar
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import TablePagination from '../components/TablePagination';

const STATUS_CHIP = {
  'PENDIENTE':  { bg: '#FEF7E0', text: '#7D4A00', label: 'Pendiente' },
  'CONFIRMADA': { bg: '#E8F0FE', text: '#1A73E8', label: 'Confirmada' },
  'ASISTIÓ':    { bg: '#E6F4EA', text: '#137333', label: 'Asistió' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F', label: 'No asistió' },
  'CANCELADA':  { bg: '#F1F3F4', text: '#5F6368', label: 'Cancelada' }
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

  const handleStatusUpdate = async (resId, newStatus) => {
    try {
      await apiClient(`/admin/reservations/${resId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setToast({ open: true, message: 'Estado actualizado correctamente' });
      fetchReservations();
      fetchCustomer();
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

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!customer) return <Box display="flex" justifyContent="center" py={10}><Typography>Customer not found</Typography></Box>;

  return (
    <Box sx={{ width: '100%', bgcolor: '#F1F3F4', minHeight: '100vh', boxSizing: 'border-box' }}>
      <Box sx={{ width: '100%', p: { xs: '16px', md: '24px' }, boxSizing: 'border-box' }}>
        
        {/* TOP BAR */}
        <Box sx={{ mb: '24px' }}>
          <Button 
            startIcon={<span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>} 
            onClick={() => navigate('/admin/customers')} 
            disableRipple
            sx={{ 
              color: '#1A73E8', textTransform: 'uppercase', fontFamily: 'Roboto', 
              fontWeight: 500, fontSize: '13px', letterSpacing: '1.25px', padding: 0,
              minWidth: 0, minHeight: { xs: 44, md: 36 },
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            VOLVER A CLIENTES
          </Button>
        </Box>

        {/* TWO COLUMN LAYOUT */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '24px' }}>
          
          {/* LEFT CARD: Customer Info */}
          <Paper sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', alignSelf: 'flex-start' }}>
            <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
              <Avatar sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', width: 56, height: 56, fontSize: '20px', fontFamily: 'Roboto', fontWeight: 500, mb: '16px' }}>
                {getInitials(customer.name)}
              </Avatar>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124', textAlign: 'center', mb: '16px' }}>
                {customer.name}
              </Typography>
              
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>mail</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>
                    {customer.email || 'Sin email'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>phone</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>
                    {customer.phone || 'Sin teléfono'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>event_available</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '13px', color: '#70757A' }}>
                    Miembro desde: {new Date(customer.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #E0E0E0' }}>
              <Box sx={{ flex: 1, p: '16px', borderRight: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
                  {customer.stats?.total_reservations || 0}
                </Typography>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px' }}>
                  Total reservas
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
                  {customer.stats?.last_visit || 'N/A'}
                </Typography>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px' }}>
                  Última visita
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* RIGHT CARD: Historial de reservas */}
          <Paper sx={{ flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ px: '24px', py: '20px', borderBottom: '1px solid #E0E0E0' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
                Historial de reservas
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F1F3F4' }}>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Fecha</TableCell>
                    <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Hora</TableCell>
                    <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Personas</TableCell>
                    <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Tipo</TableCell>
                    <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingRes && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>}
                  {!loadingRes && reservations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary" sx={{ fontFamily: 'Roboto' }}>Sin reservas registradas</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {reservations.map(r => {
                    const chip = STATUS_CHIP[r.status] || { bg: '#F1F3F4', text: '#202124', label: r.status };
                    return (
                      <TableRow key={r.id} hover onClick={() => navigate(`/admin/reservations/view/${r.id}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{r.date}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#70757A' }}>{r.time}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{r.guests}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{r.table_type?.name || 'Standard'}</Typography>
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
                                bgcolor: chip.bg, color: chip.text, borderRadius: '4px', px: '8px', py: '2px',
                                fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px',
                                '& .MuiSelect-select': { paddingTop: '4px !important', paddingBottom: '4px !important', pr: '24px !important', textTransform: 'uppercase' },
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            
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
        </Box>
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
