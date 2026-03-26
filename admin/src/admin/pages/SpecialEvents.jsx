import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, IconButton, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, CircularProgress
} from '@mui/material';
import { apiClient } from '../services/apiClient';
import TablePagination from '../components/TablePagination';

export default function SpecialEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);

  const fetchEvents = useCallback(async (p = 1, pp = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, per_page: pp });
      const data = await apiClient(`/admin/special-events?${params.toString()}`);
      setEvents(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(page, perPage); }, [page, perPage]);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({ name: event.name, description: event.description || '', is_active: !!event.is_active });
    } else {
      setEditingEvent(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (editingEvent) {
        await apiClient(`/admin/special-events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiClient('/admin/special-events', {
          method: 'POST',
          body: JSON.stringify({ ...formData, sort_order: events.length })
        });
      }
      setModalOpen(false);
      fetchEvents(page, perPage);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      await apiClient(`/admin/special-events/${editingEvent.id}`, { method: 'DELETE' });
      setDeleteModalOpen(false);
      fetchEvents(1, perPage);
      setPage(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (event) => {
    try {
      const updatedEvent = { ...event, is_active: !event.is_active };
      await apiClient(`/admin/special-events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({
           name: updatedEvent.name,
           description: updatedEvent.description,
           is_active: updatedEvent.is_active,
           sort_order: updatedEvent.sort_order
        })
      });
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    } catch (err) {
      alert(err.message);
    }
  };

  const moveEvent = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const newEvents = [...events];
    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIndex];
    newEvents[targetIndex] = temp;

    const updatedEvents = newEvents.map((e, idx) => ({ ...e, sort_order: idx }));
    setEvents(updatedEvents);

    try {
      await Promise.all([
        apiClient(`/admin/special-events/${updatedEvents[index].id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedEvents[index])
        }),
        apiClient(`/admin/special-events/${updatedEvents[targetIndex].id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedEvents[targetIndex])
        })
      ]);
    } catch (err) {
      fetchEvents();
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 0 }}>
      {/* Header bar */}
      <Box sx={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 500, fontSize: '20px', color: '#202124' }}>
          Eventos Especiales
        </Typography>
        <Button 
          variant="contained"
          startIcon={<span className="material-icons" style={{ fontSize: 16 }}>add</span>}
          onClick={() => handleOpenModal()}
          sx={{
            height: 36, px: '24px', borderRadius: '4px', bgcolor: '#1A73E8', color: '#FFFFFF',
            fontWeight: 500, fontSize: '13px', textTransform: 'uppercase'
          }}
        >
          AÑADIR EVENTO
        </Button>
      </Box>

      {/* List */}
      {events.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#BDBDBD' }}>celebration</span>
          <Typography sx={{ mt: 2, color: '#70757A', fontSize: '14px' }}>
            No hay eventos especiales. Añade el primero.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {events.map((event, index) => (
            <Box 
              key={event.id} 
              sx={{ 
                bgcolor: '#FFFFFF', p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0',
                display: 'flex', alignItems: 'center', width: '100%'
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column' }}>
                <IconButton 
                  size="small" 
                  disabled={index === 0} 
                  onClick={() => moveEvent(index, -1)}
                  sx={{ p: 0, color: '#BDBDBD' }}
                >
                  <span className="material-icons">expand_less</span>
                </IconButton>
                <span className="material-icons" style={{ fontSize: 20, color: '#BDBDBD', cursor: 'grab' }}>reorder</span>
                <IconButton 
                  size="small" 
                  disabled={index === events.length - 1} 
                  onClick={() => moveEvent(index, 1)}
                  sx={{ p: 0, color: '#BDBDBD' }}
                >
                  <span className="material-icons">expand_more</span>
                </IconButton>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '15px', color: '#202124' }}>
                  {event.name}
                </Typography>
                {event.description && (
                  <Typography sx={{ fontSize: '14px', color: '#70757A', mt: '4px' }}>
                    {event.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: '4px' }}>
                  <Box sx={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    bgcolor: event.is_active ? '#1A73E8' : '#BDBDBD', mr: 1 
                  }} />
                  <Typography sx={{ fontSize: '12px', color: '#70757A' }}>
                    {event.is_active ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Switch 
                    size="small"
                    checked={!!event.is_active} 
                    onChange={() => handleToggleActive(event)}
                    color="primary"
                  />
                  <Typography sx={{ fontSize: '12px', color: '#70757A', ml: 0.5 }}>
                    {event.is_active ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => handleOpenModal(event)}
                  sx={{ border: '1px solid #DADCE0', borderRadius: '4px', width: 28, height: 28, p: 0 }}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>edit</span>
                </IconButton>
                <IconButton 
                  onClick={() => { setEditingEvent(event); setDeleteModalOpen(true); }}
                  sx={{ border: '1px solid #FDECEA', borderRadius: '4px', width: 28, height: 28, p: 0, bgcolor: '#FDECEA' }}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: '#D93025' }}>delete</span>
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <TablePagination
        meta={meta}
        page={page}
        perPage={perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
      />

      {/* Add / Edit Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '4px', width: '100%', maxWidth: 480, p: '24px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: '16px', color: '#202124', mb: '20px' }}>
          {editingEvent ? 'Editar evento' : 'Añadir evento'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField 
            fullWidth label="Nombre" variant="outlined" required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={modalOpen && !formData.name.trim()}
            helperText={modalOpen && !formData.name.trim() ? "El nombre es obligatorio" : ""}
            InputLabelProps={{ shrink: true }}
            placeholder="Nombre"
            sx={{ 
              '& .MuiOutlinedInput-root': { height: 56, borderRadius: '4px' },
              '& .MuiInputLabel-root': { color: '#70757A', fontSize: '12px' }
            }}
          />
          <TextField 
            fullWidth label="Descripción" variant="outlined" multiline rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Descripción"
            sx={{ 
              '& .MuiOutlinedInput-root': { p: '12px', borderRadius: '4px' },
              '& .MuiInputLabel-root': { color: '#70757A', fontSize: '12px' }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '14px', color: '#202124' }}>Visible para clientes</Typography>
            <Switch 
              checked={formData.is_active} 
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
              color="primary"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', mt: '24px' }}>
          <Button 
            onClick={() => setModalOpen(false)}
            sx={{ border: '1px solid #DADCE0', color: '#70757A', px: '24px', height: 36, borderRadius: '4px', fontWeight: 500, fontSize: '13px' }}
          >
            CANCELAR
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name.trim() || submitting}
            sx={{ bgcolor: '#1A73E8', color: '#FFFFFF', px: '24px', height: 36, borderRadius: '4px', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase' }}
          >
            {submitting ? 'GUARDANDO...' : 'GUARDAR'}
          </Button>
        </Box>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '4px', width: '100%', maxWidth: 400, p: '24px' } }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: '16px', color: '#202124', mb: '12px' }}>Eliminar evento</Typography>
        <Typography sx={{ fontSize: '14px', color: '#70757A', mb: '24px' }}>
          ¿Eliminar '{editingEvent?.name}'? Las reservas existentes no se verán afectadas.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button 
            onClick={() => setDeleteModalOpen(false)} 
            sx={{ border: '1px solid #DADCE0', color: '#70757A', px: '24px', height: 36, borderRadius: '4px' }}
          >
            VOLVER
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            sx={{ bgcolor: '#D93025', color: '#FFFFFF', px: '24px', height: 36, borderRadius: '4px', '&:hover': { bgcolor: '#B71C1C' } }}
          >
            ELIMINAR
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
