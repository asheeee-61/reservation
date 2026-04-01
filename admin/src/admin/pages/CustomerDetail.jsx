import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, CircularProgress,
  Divider, IconButton, Tooltip, Chip, TextField, Autocomplete
} from '@mui/material';
import { apiClient } from '../../shared/api';
import CustomerAvatar from '../components/CustomerAvatar';
import TablePagination from '../components/TablePagination';
import { BackButton } from '../components/BackButton';
import { useToast } from '../components/Toast/ToastContext';
import { PageHeaderSkeleton, CardSkeleton, TableSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';

const STATUS_CHIP_STYLE = {
  'PENDIENTE':  { bg: '#FEF7E0', text: '#7D4A00', label: 'Pendiente' },
  'CONFIRMADA': { bg: '#E6F4EA', text: '#137333', label: 'Confirmada' },
  'ASISTIÓ':    { bg: '#E8F0FE', text: '#1A73E8', label: 'Asistió' },
  'NO_ASISTIÓ': { bg: '#FDECEA', text: '#C5221F', label: 'No asistió' },
  'CANCELADA':  { bg: '#FDECEA', text: '#C5221F', label: 'Cancelada' }
};


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

  const toast = useToast();
  const [savingNotes, setSavingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/admin/customers/${id}`);
      setCustomer(data);
      setLocalNotes(data.notes || '');
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

  const updateCustomerData = async (payload) => {
    try {
      await apiClient(`/admin/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...customer,
          ...payload
        })
      });
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar cambios');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(customer.tags || []), tagInput.trim()];
    const uniqueTags = [...new Set(newTags)];
    setCustomer({ ...customer, tags: uniqueTags });
    updateCustomerData({ tags: uniqueTags });
    setTagInput('');
  };

  const handleDeleteTag = (tagToDelete) => {
    const newTags = (customer.tags || []).filter(t => t !== tagToDelete);
    setCustomer({ ...customer, tags: newTags });
    updateCustomerData({ tags: newTags });
  };

  const handleStartEdit = () => {
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveInfo = async () => {
    if (!editForm.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    await updateCustomerData(editForm);
    setCustomer({ ...customer, ...editForm });
    setIsEditing(false);
    toast.success('Datos actualizados correctamente');
  };

  useEffect(() => {
    if (customer && localNotes !== customer.notes) {
      setSavingNotes(true);
      const timer = setTimeout(() => {
        updateCustomerData({ notes: localNotes });
        setCustomer(prev => ({ ...prev, notes: localNotes }));
        setSavingNotes(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localNotes, id]);

  if (loading) return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <PageHeaderSkeleton />
      <CardSkeleton />
      <TableSkeleton rows={3} cols={5} />
    </Box>
  );
  if (!customer) return <EmptyState icon="person_off" title="Cliente no encontrado" message="El cliente solicitado no existe o fue eliminado." />;

  const avgDisplay = Number.isInteger(stats.avgParty) 
    ? stats.avgParty.toString() 
    : stats.avgParty.toFixed(1);

  return (
    <Box sx={{ width: '100%', bgcolor: '#F1F3F4', minHeight: '100vh', p: '24px', boxSizing: 'border-box' }}>
      
      {/* ROW 1: BACK BUTTON */}
      <Box sx={{ mb: '24px' }}>
        <BackButton fallback="/admin/customers" />
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
            <CustomerAvatar 
              name={customer.name} 
              counts={{
                total: customer.reservations_count,
                arrived: customer.arrived_count,
                noShow: customer.no_show_count
              }}
              size={72}
            />
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                sx={{ 
                  mt: '12px', 
                  '& .MuiOutlinedInput-root': { borderRadius: '4px', textAlign: 'center' },
                  '& input': { textAlign: 'center', fontWeight: 500, fontSize: '18px', p: '8px' }
                }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '12px' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124', textAlign: 'center' }}>
                  {customer.name}
                </Typography>
                <IconButton size="small" onClick={handleStartEdit} sx={{ color: '#70757A', p: '4px' }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                </IconButton>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>mail_outline</span>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    sx={{ '& input': { fontSize: '14px', fontFamily: 'Roboto', p: 0 } }}
                  />
                ) : (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: customer.email ? '#202124' : '#BDBDBD', fontStyle: customer.email ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.email || 'Sin correo'}
                  </Typography>
                )}
              </Box>
              {!isEditing && customer.email && (
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>phone</span>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    sx={{ '& input': { fontSize: '14px', fontFamily: 'Roboto', p: 0 } }}
                  />
                ) : (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: customer.phone ? '#202124' : '#BDBDBD', fontStyle: customer.phone ? 'normal' : 'italic' }}>
                    {customer.phone || 'Sin teléfono'}
                  </Typography>
                )}
              </Box>
              {!isEditing && customer.phone && (
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

          {isEditing && (
            <Box sx={{ display: 'flex', gap: '8px', mt: '16px' }}>
              <Button 
                fullWidth 
                variant="contained" 
                size="small"
                onClick={handleSaveInfo}
                sx={{ bgcolor: '#1A73E8', boxShadow: 'none', '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' } }}
              >
                GUARDAR
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                onClick={handleCancelEdit}
                sx={{ color: '#70757A', borderColor: '#E0E0E0', '&:hover': { bgcolor: '#F1F3F4', borderColor: '#E0E0E0' } }}
              >
                CANCELAR
              </Button>
            </Box>
          )}

          <Divider sx={{ my: '20px', borderColor: '#E0E0E0' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
              {formatLastVisit(customer.stats?.last_visit)}
            </Typography>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A' }}>
              Última visita
            </Typography>
          </Box>

          <Divider sx={{ my: '20px', borderColor: '#E0E0E0' }} />

          {/* TAGS SECTION */}
          <Box sx={{ mb: '20px' }}>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '8px', textTransform: 'uppercase' }}>
              Etiquetas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mb: '12px' }}>
              {(customer.tags || []).map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                  sx={{ 
                    bgcolor: '#E8F0FE', color: '#1A73E8', borderRadius: '4px', 
                    fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px',
                    '& .MuiChip-deleteIcon': { color: '#1A73E8', fontSize: '14px' }
                  }}
                />
              ))}
              {(customer.tags || []).length === 0 && (
                <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#BDBDBD', fontStyle: 'italic' }}>
                  Sin etiquetas
                </Typography>
              )}
            </Box>
            <TextField 
              size="small"
              placeholder="Añadir etiqueta..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: '4px', height: '36px', fontSize: '13px', fontFamily: 'Roboto' }
              }}
              fullWidth
            />
          </Box>

          {/* NOTES SECTION */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase' }}>
                Notas internas
              </Typography>
              {savingNotes && <CircularProgress size={12} sx={{ color: '#1A73E8' }} />}
            </Box>
            <TextField 
              multiline
              rows={4}
              placeholder="Escribe notas privadas sobre este cliente..."
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '4px', fontSize: '13px', fontFamily: 'Roboto', p: '8px',
                  bgcolor: '#F8F9FA'
                }
              }}
              fullWidth
            />
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={`skeleton-${i}-${j}`}>
                          <Box sx={{ width: '100%', height: 20, bgcolor: '#F1F3F4', borderRadius: 1, animation: 'pulse 1.5s infinite ease-in-out' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 0, borderBottom: 'none' }}>
                      <Box sx={{ py: 4 }}><EmptyState icon="calendar_today" title="Sin historial" message="No se encontraron reservas para este cliente." /></Box>
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
                          {r.zone?.name || '—'}
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

    </Box>
  );
}
