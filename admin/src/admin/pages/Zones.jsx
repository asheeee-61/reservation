import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, IconButton, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel
} from '@mui/material';
import { apiClient } from '../../shared/api';
import TablePagination from '../components/TablePagination';
import { useToast } from '../components/Toast/ToastContext';
import { TableSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';

export default function Zones() {
  const [types, setTypes] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);

  const fetchTypes = useCallback(async (p = page, pp = perPage, signal) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, per_page: pp });
      const data = await apiClient(`/admin/zones?${params.toString()}`, { signal });
      setTypes(data.data ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { 
    const controller = new AbortController();
    fetchTypes(page, perPage, controller.signal);
    return () => controller.abort();
  }, [page, perPage, fetchTypes]);

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name, description: type.description || '', is_active: !!type.is_active });
    } else {
      setEditingType(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (editingType) {
        await apiClient(`/admin/zones/${editingType.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiClient('/admin/zones', {
          method: 'POST',
          body: JSON.stringify({ ...formData, sort_order: types.length })
        });
      }
      setModalOpen(false);
      fetchTypes(page, perPage);
      toast.success('Zona guardada');
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingType) return;
    setSubmitting(true);
    try {
      await apiClient(`/admin/zones/${editingType.id}`, { method: 'DELETE' });
      setDeleteModalOpen(false);
      fetchTypes(1, perPage);
      setPage(1);
      toast.success('Zona eliminada');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (type) => {
    try {
      const updatedType = { ...type, is_active: !type.is_active };
      await apiClient(`/admin/zones/${type.id}`, {
        method: 'PUT',
        body: JSON.stringify({
           name: updatedType.name,
           description: updatedType.description,
           is_active: updatedType.is_active,
           sort_order: updatedType.sort_order
        })
      });
      setTypes(types.map(t => t.id === type.id ? updatedType : t));
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  // Simple reordering logic
  const moveType = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= types.length) return;

    const newTypes = [...types];
    const temp = newTypes[index];
    newTypes[index] = newTypes[targetIndex];
    newTypes[targetIndex] = temp;

    // Update sort_order based on new positions
    const updatedTypes = newTypes.map((t, idx) => ({ ...t, sort_order: idx }));
    setTypes(updatedTypes);

    // Persist changes
    try {
      await Promise.all([
        apiClient(`/admin/zones/${updatedTypes[index].id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedTypes[index])
        }),
        apiClient(`/admin/zones/${updatedTypes[targetIndex].id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedTypes[targetIndex])
        })
      ]);
    } catch (err) {
      fetchTypes(page, perPage); // Rollback
    }
  };


  return (
    <Box sx={{ p: 0 }}>
      {/* Header bar */}
      <Box sx={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '24px' 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 500, fontSize: '20px', color: '#202124', letterSpacing: '1.5px' }}>
          ZONAS
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
          Añadir zona
        </Button>
      </Box>

      {/* List */}
      <Box sx={{ position: 'relative', mt: 3 }}>
        {loading ? (
          <Box p={3}><TableSkeleton rows={5} cols={3} /></Box>
        ) : types.length === 0 ? (
          <EmptyState 
            icon="map" 
            title="Sin zonas" 
            message="No hay zonas configuradas. Añade la primera." 
            action={{
              label: 'Añadir zona',
              onClick: () => handleOpenModal()
            }} 
          />
        ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {types.map((type, index) => (
            <Box 
              key={type.id} 
              sx={{ 
                bgcolor: '#FFFFFF', p: '16px', borderRadius: '4px', border: '1px solid #E0E0E0',
                display: 'flex', alignItems: 'center', width: '100%'
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column' }}>
                <IconButton 
                  size="small" 
                  disabled={index === 0} 
                  onClick={() => moveType(index, -1)}
                  sx={{ p: 0, color: '#BDBDBD' }}
                >
                  <span className="material-icons">expand_less</span>
                </IconButton>
                <span className="material-icons" style={{ fontSize: 20, color: '#BDBDBD', cursor: 'grab' }}>reorder</span>
                <IconButton 
                  size="small" 
                  disabled={index === types.length - 1} 
                  onClick={() => moveType(index, 1)}
                  sx={{ p: 0, color: '#BDBDBD' }}
                >
                  <span className="material-icons">expand_more</span>
                </IconButton>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '15px', color: '#202124' }}>
                  {type.name}
                </Typography>
                {type.description && (
                  <Typography sx={{ fontSize: '14px', color: '#70757A', mt: '4px' }}>
                    {type.description}
                  </Typography>
                )}

              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Switch 
                    size="small"
                    checked={!!type.is_active} 
                    onChange={() => handleToggleActive(type)}
                    color="primary"
                  />
                  <Typography sx={{ fontSize: '12px', color: '#70757A', ml: 0.5 }}>
                    {type.is_active ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => handleOpenModal(type)}
                  sx={{ border: '1px solid #DADCE0', borderRadius: '4px', width: 28, height: 28, p: 0 }}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: '#70757A' }}>edit</span>
                </IconButton>
                <IconButton 
                  onClick={() => { setEditingType(type); setDeleteModalOpen(true); }}
                  sx={{ border: '1px solid #FDECEA', borderRadius: '4px', width: 28, height: 28, p: 0, bgcolor: '#FDECEA' }}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: '#D93025' }}>delete</span>
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>

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
          {editingType ? 'Editar zona' : 'Añadir zona'}
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
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, color: '#202124' }}>Visible para clientes</Typography>
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

      <ConfirmModal 
        open={deleteModalOpen}
        title="Eliminar zona"
        body={`¿Estás seguro de que deseas eliminar la zona "${editingType?.name}"? Esta acción no afectará a las reservas existentes.`}
        confirmLabel="Eliminar"
        confirmColor="#D93025"
        confirmDisabled={submitting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
