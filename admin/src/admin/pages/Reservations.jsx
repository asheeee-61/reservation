// Force Vite reload — Unified pagination
import { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, MenuItem, Select, FormControl,
  IconButton, Tooltip, Stack, TextField, InputAdornment, 
  Fab, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api';
import CustomerAvatar from '../components/CustomerAvatar';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';
import TablePagination from '../components/TablePagination';
import SourceBadge from '../components/SourceBadge';
import { useToast } from '../components/Toast/ToastContext';
import { TableSkeleton, PageHeaderSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmModal } from '../components/ConfirmModal';
import { CircularProgress } from '@mui/material';

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

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedResId, setSelectedResId] = useState(null);

  const fetchReservations = useCallback(async (p = page, pp = perPage, search = searchTerm, status = statusFilter, signal) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: p, per_page: pp });
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      const data = await apiClient(`/admin/reservations?${params.toString()}`, { signal });
      setReservations(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (e) {
      if (e.name !== 'AbortError') setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, perPage, searchTerm, statusFilter]);

  // Single unified fetch — reacts to any filter/page/perPage change
  useEffect(() => {
    const controller = new AbortController();
    fetchReservations(page, perPage, searchTerm, statusFilter, controller.signal);
    return () => controller.abort();
  }, [page, perPage, searchTerm, statusFilter, fetchReservations]);

  const handleStatusChange = async (id, newStatus, reason = null) => {
    if (newStatus === 'CANCELADA' && !reason) {
      setSelectedResId(id);
      setCancelModalOpen(true);
      return;
    }

    setStatusUpdatingId(id);
    const previous = [...reservations];
    
    // Optimistic update
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status: newStatus } : res
    ));

    try {
      await apiClient(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: newStatus,
          cancellation_reason: reason
        })
      });
      toast.success('Estado actualizado correctamente');
    } catch (e) {
      toast.error('Error al actualizar el estado');
      setReservations(previous);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCancelConfirm = () => {
    handleStatusChange(selectedResId, 'CANCELADA', cancelReason || 'Cancelada por el administrador');
    setCancelModalOpen(false);
    setCancelReason('');
    setSelectedResId(null);
  };

  const handleSearchChange = (e) => {
    setPage(1);
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setPage(1);
    setStatusFilter(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPer) => {
    setPerPage(newPer);
    setPage(1);
  };

  if (error) {
    return (
      <ErrorState 
        message="Error al cargar los datos."
        onRetry={() => {
          const controller = new AbortController();
          fetchReservations(page, perPage, searchTerm, statusFilter, controller.signal);
        }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ 
            fontFamily: 'Roboto', fontWeight: 500, color: '#202124',
            [DESKTOP]: { fontSize: '20px' },
            [TABLET]: { fontSize: '18px' },
            [MOBILE]: { fontSize: '16px' }
          }}>
            Reservas
          </Typography>
        </Box>
      )}

      {/* FILTERS */}
      <Paper sx={{ 
        p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', 
        display: 'flex', 
        [DESKTOP]: { gap: '16px', flexDirection: 'row' },
        [TABLET]: { gap: '16px', flexDirection: 'row' },
        [MOBILE]: { gap: '8px', flexDirection: 'column', p: '16px' }
      }}>
        <TextField
          size="small"
          placeholder="Buscar reservas..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' } 
            }
          }}
          sx={{ 
            flexGrow: 1, 
            [DESKTOP]: { maxWidth: 400 },
            [TABLET]: { maxWidth: 400 },
            [MOBILE]: { width: '100%', maxWidth: 'none', height: 52 }
          }}
        />
        <FormControl size="small" sx={{ 
          [DESKTOP]: { minWidth: 150 },
          [TABLET]: { minWidth: 150 },
          [MOBILE]: { width: '100%', minWidth: '100%' }
        }}>
          <Select 
            value={statusFilter} 
            onChange={handleStatusFilterChange}
            displayEmpty
            sx={{ 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' }
            }}
          >
            <MenuItem value="all">Todas</MenuItem>
            {Object.keys(STATUS_COLORS).map(s => (
              <MenuItem key={s} value={s}>{STATUS_LABELS[s] || s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* DESKTOP & TABLET TABLE VIEW */}
      <Paper sx={{ 
        display: 'none', [DESKTOP]: { display: 'block' }, [TABLET]: { display: 'block' },
        overflow: 'hidden', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none',
        position: 'relative'
      }}>
        {loading ? (
          <Box p={3}>
            <TableSkeleton rows={8} cols={9} />
          </Box>
        ) : reservations.length === 0 ? (
          <EmptyState 
            icon="event_note" 
            title="Sin resultados" 
            message="No hay reservas que mostrar" 
          />
        ) : (
        <>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>#</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Cliente</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Fecha y hora</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Zona</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Evento</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Personas</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Estado</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Origen</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map(res => (
              <TableRow 
                key={res.id} 
                hover
                onClick={() => navigate(`/admin/reservations/view/${res.id}`, { state: { reservation: res } })}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>#{res.reservation_id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {res.customer ? (
                      <>
                        <CustomerAvatar 
                          name={res.customer.name} 
                          counts={{
                            total: res.customer.reservations_count,
                            arrived: res.customer.arrived_count,
                            noShow: res.customer.no_show_count
                          }}
                          size={28}
                        />
                        <Box>
                          <Typography 
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${res.customer.id}`); }}
                            sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#1A73E8', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {res.customer.name}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>—</Typography>
                    )}
                  </Box>
                  {res.special_requests && (
                    <Typography noWrap sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', mt: '2px', maxWidth: 200 }} display="block">
                      Nota: {res.special_requests}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.date}</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{res.time}</Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>
                  {res.zone?.name || <Box component="span" sx={{ color: '#BDBDBD' }}>Sin zona</Box>}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>
                  {res.event?.name || <Box component="span" sx={{ color: '#BDBDBD' }}>—</Box>}
                </TableCell>
                <TableCell align="center" sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{res.guests}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const sKey = res.status?.toUpperCase() || 'PENDIENTE';
                    const colors = STATUS_COLORS[sKey] || { bg: '#F1F3F4', text: '#5F6368' };
                    return (
                      <FormControl size="small" variant="standard" sx={{ m: 0, p: 0, position: 'relative' }}>
                        <Select
                          value={sKey}
                          onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          disabled={statusUpdatingId === res.id}
                          disableUnderline
                          sx={{ 
                            bgcolor: colors.bg, 
                            color: colors.text, 
                            borderRadius: '4px', 
                            px: '8px', 
                            py: '2px',
                            minWidth: '110px',
                            fontFamily: 'Roboto', 
                            fontWeight: 500, 
                            fontSize: '12px',
                            opacity: statusUpdatingId === res.id ? 0.7 : 1,
                            '& .MuiSelect-select': { 
                              paddingTop: '4px !important',
                              paddingBottom: '4px !important',
                              textAlign: 'center',
                              textTransform: 'uppercase'
                            },
                            '& .MuiSvgIcon-root': { color: colors.text, right: 2 }
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
                                   '&:hover': { bgcolor: '#F1F3F4' },
                                   '&.Mui-selected': { bgcolor: '#E8F0FE' }
                                 }
                               }
                             }
                          }}
                        >
                          {Object.keys(STATUS_COLORS).map(status => (
                            <MenuItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </MenuItem>
                          ))}
                        </Select>
                        {statusUpdatingId === res.id && (
                          <Box sx={{ position: 'absolute', right: -25, top: 4 }}>
                            <CircularProgress size={16} sx={{ color: colors.text }} />
                          </Box>
                        )}
                      </FormControl>
                    );
                  })() || <Box component="span" sx={{ color: '#BDBDBD' }}>—</Box>}
                </TableCell>
                <TableCell>
                  <SourceBadge source={res.source} />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                    {/* EDIT */}
                    <IconButton 
                      onClick={() => navigate(`/admin/reservations/edit/${res.id}`, { state: { reservation: res } })}
                      sx={{ 
                        width: 32, height: 32, borderRadius: '4px', border: '1px solid #DADCE0', bgcolor: '#FFFFFF', color: '#70757A',
                        '&:hover': { bgcolor: '#F1F3F4' }
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                    </IconButton>

                    {/* WHATSAPP */}
                    {(() => {
                      const phone = res.customer?.phone?.replace(/\D/g, '');
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
                      const email = res.customer?.email;
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          meta={meta}
          page={page}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
        </>
        )}
      </Paper>

      {/* MOBILE CARD VIEW */}
      <Box sx={{ 
        display: 'none', flexDirection: 'column', gap: '8px',
        [MOBILE]: { display: 'flex' },
        position: 'relative'
      }}>
        {loading ? (
          <Box p={2} display="flex" flexDirection="column" gap={2}>
            <TableSkeleton rows={4} cols={1} />
          </Box>
        ) : reservations.length === 0 ? (
          <EmptyState 
            icon="event_note" 
            title="Sin resultados" 
            message="No hay reservas que mostrar" 
          />
        ) : (
          <>
            {reservations.map(res => {
              const sKey = res.status?.toUpperCase() || 'PENDIENTE';
          const chipColor = STATUS_COLORS[sKey] || { bg: '#F1F3F4', text: '#202124' };
          return (
            <Paper 
              key={res.id}
              onClick={() => navigate(`/admin/reservations/view/${res.id}`, { state: { reservation: res } })}
              sx={{ 
                p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF', boxShadow: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                    #{res.reservation_id}
                  </Typography>
                  <SourceBadge source={res.source} />
                </Box>
                <Box sx={{ bgcolor: chipColor.bg, color: chipColor.text, borderRadius: '4px', px: '8px', py: '4px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {STATUS_LABELS[sKey] || res.status || 'PENDIENTE'}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>
                {res.date} · {res.time}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {res.guests} personas · {res.zone?.name || 'Sin zona'}
              </Typography>
              <Box sx={{ mt: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CustomerAvatar 
                  name={res.customer?.name} 
                  counts={{
                    total: res.customer?.reservations_count,
                    arrived: res.customer?.arrived_count,
                    noShow: res.customer?.no_show_count
                  }}
                  size={24}
                />
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#1A73E8' }}>
                  {res.customer?.name || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          );
        })}
        <TablePagination
          meta={meta}
          page={page}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
        </>
        )}
      </Box>

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' }, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        onClick={() => navigate('/admin/reservations/new')}
      >
        <span className="material-icons">add</span>
      </Fab>

      <ConfirmModal 
        open={cancelModalOpen}
        title="Cancelar reserva"
        body="¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer."
        confirmLabel="Cancelar Reserva"
        confirmColor="#D93025"
        confirmDisabled={statusUpdatingId !== null}
        showInput={true}
        inputValue={cancelReason}
        onInputChange={setCancelReason}
        inputPlaceholder="Motivo (opcional — se enviará al cliente)"
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason('');
          setSelectedResId(null);
        }}
        onConfirm={handleCancelConfirm}
      />
    </Box>
  );
}
