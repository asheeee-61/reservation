import { useState, useEffect } from 'react';
import { 
  Dialog, Drawer, useMediaQuery, useTheme, Box, 
  IconButton, Typography, TextField, Button, CircularProgress,
  Chip
} from '@mui/material';
import { apiClient } from '../../shared/api';
import { useToast } from './Toast/ToastContext';

export default function CustomerFormModal({ open, onClose, customerData, onSuccess }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        notes: customerData.notes || '',
        tags: customerData.tags || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        tags: []
      });
    }
  }, [customerData, open]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const method = customerData ? 'PUT' : 'POST';
      const url = customerData ? `/admin/customers/${customerData.id}` : '/admin/customers';
      
      const response = await apiClient(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (response.success) {
        toast.success(customerData ? 'Cliente actualizado' : 'Cliente creado');
        if (onSuccess) onSuccess(response.data);
        onClose();
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setFormData({
      ...formData,
      tags: [...formData.tags, tagInput.trim()]
    });
    setTagInput('');
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToDelete)
    });
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFFFF' }}>
      <Box sx={{ 
        p: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 10 
      }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
          {customerData ? 'Editar cliente' : 'Nuevo cliente'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#70757A' }}>
          <span className="material-icons">close</span>
        </IconButton>
      </Box>

      <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <TextField
          label="Nombre completo"
          fullWidth
          required
          size="small"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '20px' }}>
          <TextField
            label="Correo electrónico"
            fullWidth
            size="small"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />
          <TextField
            label="Teléfono"
            fullWidth
            size="small"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />
        </Box>

        <Box>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '8px', textTransform: 'uppercase' }}>
            Etiquetas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mb: '12px' }}>
            {formData.tags.map(tag => (
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
          </Box>
          <TextField 
            size="small"
            placeholder="Añadir etiqueta..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            sx={{ 
              '& .MuiOutlinedInput-root': { borderRadius: '4px', height: '36px', fontSize: '13px', fontFamily: 'Roboto' }
            }}
            fullWidth
          />
        </Box>

        <Box>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', mb: '8px', textTransform: 'uppercase' }}>
            Notas internas
          </Typography>
          <TextField 
            multiline
            rows={4}
            placeholder="Escribe notas privadas sobre este cliente..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '4px', fontSize: '13px', fontFamily: 'Roboto', p: '8px',
                bgcolor: '#F8F9FA'
              }
            }}
            fullWidth
          />
        </Box>
      </Box>

      <Box sx={{ 
        p: '16px 24px', bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', 
        display: 'flex', justifyContent: 'flex-end', gap: '12px',
        position: 'sticky', bottom: 0, zIndex: 10
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            color: '#70757A', borderColor: '#DADCE0', borderRadius: '4px',
            fontFamily: 'Roboto', fontWeight: 500, textTransform: 'none'
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ 
            bgcolor: '#1A73E8', borderRadius: '4px', boxShadow: 'none',
            fontFamily: 'Roboto', fontWeight: 500, textTransform: 'none',
            '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (customerData ? 'Guardar cambios' : 'Crear cliente')}
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer 
        anchor="bottom" 
        open={open} 
        onClose={onClose} 
        PaperProps={{ 
          sx: { 
            borderTopLeftRadius: '16px', 
            borderTopRightRadius: '16px', 
            maxHeight: '90vh',
            minHeight: '60vh'
          } 
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { borderRadius: '8px', overflow: 'hidden' } 
      }}
    >
      {content}
    </Dialog>
  );
}
