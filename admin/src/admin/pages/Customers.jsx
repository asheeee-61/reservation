import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Tooltip, TextField, InputAdornment, Avatar, Chip
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import CustomerAvatar from '../components/CustomerAvatar';
import { MOBILE, TABLET, DESKTOP } from '../utils/breakpoints';
import TablePagination from '../components/TablePagination';

export default function Customers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);

  const fetchCustomers = useCallback(async (p = page, pp = perPage, search = searchTerm, signal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, per_page: pp });
      if (search) params.append('search', search);
      const data = await apiClient(`/admin/customers?${params.toString()}`, { signal });
      setCustomers(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm]);

  // Unified fetch effect with AbortController
  useEffect(() => {
    const controller = new AbortController();
    fetchCustomers(page, perPage, searchTerm, controller.signal);
    return () => controller.abort();
  }, [page, perPage, searchTerm, fetchCustomers]);

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePerPageChange = (newPer) => { setPerPage(newPer); setPage(1); };

  const sanitizePhone = (phone) => phone?.replace(/[\s+]/g, '').replace(/\D/g, '') || '';

  // MD2 action button — matches Reservations style exactly
  const ActionBtn = ({ icon, tooltip, onClick, disabled }) => (
    <Tooltip title={disabled ? '' : tooltip}>
      <Box
        component="span"
        onClick={disabled ? undefined : onClick}
        sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer',
          border: disabled ? '1px solid #E0E0E0' : '1px solid #DADCE0',
          bgcolor: disabled ? 'transparent' : '#FFFFFF',
          color: disabled ? '#BDBDBD' : '#70757A',
          transition: 'background 0.15s',
          '&:hover': disabled ? {} : { bgcolor: '#F1F3F4' },
        }}
      >
        <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
      </Box>
    </Tooltip>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography sx={{ 
        fontFamily: 'Roboto', fontWeight: 500, color: '#202124',
        [DESKTOP]: { fontSize: '20px' },
        [TABLET]: { fontSize: '18px' },
        [MOBILE]: { fontSize: '16px' }
      }}>
        DIRECTORIO DE CLIENTES
      </Typography>

      <Paper sx={{ p: '24px', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none', [MOBILE]: { p: '16px' } }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span className="material-icons">search</span></InputAdornment>,
            sx: { 
              borderRadius: '4px', fontFamily: 'Roboto',
              [MOBILE]: { height: 52, fontSize: '16px' }
            }
          }}
          sx={{ width: '100%', [DESKTOP]: { maxWidth: 400 }, [TABLET]: { maxWidth: 400 } }}
        />
      </Paper>

      {/* DESKTOP & TABLET TABLE VIEW */}
      <Paper sx={{ 
        display: 'none', [DESKTOP]: { display: 'block' }, [TABLET]: { display: 'block' },
        overflowX: 'auto', borderRadius: '4px', border: '1px solid #E0E0E0', boxShadow: 'none' 
      }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ bgcolor: '#F1F3F4', borderBottom: '1px solid #E0E0E0' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>CLIENTE</TableCell>
              <TableCell sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>CONTACTO</TableCell>
              <TableCell align="center" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>VISITAS TOTALES</TableCell>
              <TableCell sx={{ 
                fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px',
                [TABLET]: { display: 'none' } 
              }}>ÚLTIMA VISITA</TableCell>
              <TableCell align="right" sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#5F6368', fontSize: '12px' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Cargando...</TableCell></TableRow>}
            {!loading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary" sx={{ fontFamily: 'Roboto' }}>No se encontraron clientes.</Typography>
                </TableCell>
              </TableRow>
            )}
            {customers.map(c => (
              <TableRow key={c.id} hover onClick={() => navigate(`/admin/customers/${c.id}`)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <CustomerAvatar 
                      name={c.name} 
                      counts={{
                        total: c.reservations_count,
                        arrived: c.arrived_count,
                        noShow: c.no_show_count
                      }}
                      size={32}
                    />
                    <Box>
                      <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: '#202124' }}>{c.name}</Typography>
                      {c.tags && c.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: '4px' }}>
                          {c.tags.slice(0, 3).map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              sx={{ 
                                height: '18px', fontSize: '10px', bgcolor: '#E8F0FE', color: '#1A73E8', 
                                border: 'none', borderRadius: '4px', fontFamily: 'Roboto' 
                              }} 
                            />
                          ))}
                          {c.tags.length > 3 && (
                            <Typography sx={{ fontSize: '10px', color: '#70757A', fontFamily: 'Roboto' }}>
                              +{c.tags.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{c.email}</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A' }}>{c.phone}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, bgcolor: '#F1F3F4', borderRadius: '4px', fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#202124' }}>
                    {c.total_reservations || 0}
                  </Box>
                </TableCell>
                <TableCell sx={{ [TABLET]: { display: 'none' } }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#202124' }}>{c.last_visit || 'Nunca'}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <ActionBtn
                      icon="chat"
                      tooltip="Enviar WhatsApp"
                      disabled={!c.phone}
                      onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${sanitizePhone(c.phone)}`, '_blank'); }}
                    />
                    <ActionBtn
                      icon="mail"
                      tooltip="Enviar correo"
                      disabled={!c.email}
                      onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${c.email}`; }}
                    />
                  </Box>
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
      </Paper>

      {/* MOBILE CARD VIEW */}
      <Box sx={{ 
        display: 'none', flexDirection: 'column', gap: '8px',
        [MOBILE]: { display: 'flex' }
      }}>
        {!loading && customers.length === 0 && (
          <Box display="flex" justifyContent="center" py={3}><Typography color="text.secondary">No se encontraron clientes.</Typography></Box>
        )}
        {customers.map(c => (
          <Paper 
            key={c.id}
            onClick={() => navigate(`/admin/customers/${c.id}`)}
            sx={{ 
              p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0', 
              bgcolor: '#FFFFFF', boxShadow: 'none',
              display: 'flex', flexDirection: 'column', gap: '8px',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F8F9FA' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '4px' }}>
              <CustomerAvatar 
                name={c.name} 
                counts={{
                  total: c.reservations_count,
                  arrived: c.arrived_count,
                  noShow: c.no_show_count
                }}
                size={36}
              />
              <Box>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                  {c.name}
                </Typography>
                {c.tags && c.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: '2px' }}>
                    {c.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ 
                          height: '16px', fontSize: '9px', bgcolor: '#E8F0FE', color: '#1A73E8', 
                          border: 'none', borderRadius: '4px', fontFamily: 'Roboto' 
                        }} 
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box sx={{ pl: '48px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {c.email || '—'}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                {c.phone || '—'}
              </Typography>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#70757A', mt: '4px' }}>
                {c.total_reservations || 0} reservas · {c.last_visit || 'Nunca'}
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px', mt: '8px' }}>
                <ActionBtn
                  icon="chat"
                  tooltip="Enviar WhatsApp"
                  disabled={!c.phone}
                  onClick={() => window.open(`https://wa.me/${sanitizePhone(c.phone)}`, '_blank')}
                />
                <ActionBtn
                  icon="mail"
                  tooltip="Enviar correo"
                  disabled={!c.email}
                  onClick={() => { window.location.href = `mailto:${c.email}`; }}
                />
              </Box>
            </Box>
          </Paper>
        ))}
        <TablePagination
          meta={meta}
          page={page}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </Box>

    </Box>
  );
}
