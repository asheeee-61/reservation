import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useWizardStore } from '../store/useWizardStore';
import { useToast } from '../components/Toast/ToastContext';
import { PageHeaderSkeleton, CardSkeleton } from '../components/Skeletons';
import { API_BASE_URL } from '../../shared/api';

export default function Profile() {
  const { token, user: userStore, setUser: setUserStore } = useAuthStore();
  const startWizard = useWizardStore(state => state.startWizard);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const toast = useToast();

  // Initials logic
  const getInitials = (fullName) => {
    if (!fullName) return '??';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return fullName.substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        if (setUserStore) {
          setUserStore(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (password || passwordConfirmation) {
      if (password !== passwordConfirmation) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
    }
    setPasswordError('');
    setSaving(true);
    
    try {
      const payload = { name };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      
      const res = await fetch(`${API_BASE_URL}/admin/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Error saving profile');
      
      const data = await res.json();
      setName(data.name || '');
      if (setUserStore) setUserStore(data); // Assuming we persist user info in store
      
      setPassword('');
      setPasswordConfirmation('');
      
      toast.success('Perfil actualizado');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <PageHeaderSkeleton />
        <CardSkeleton />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: '#F1F3F4',
      pt: '48px',
      pb: '48px',
      minHeight: '100%',
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '480px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '4px',
        p: '32px'
      }}>
        {/* Avatar Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: '24px' }}>
          <Box sx={{ 
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: '#1A73E8', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '28px',
            mb: '8px'
          }}>
            {getInitials(name)}
          </Box>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124', mb: '4px' }}>
            {name}
          </Typography>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A' }}>
            Administrador
          </Typography>

          <Button
            id="wizard-start-btn"
            onClick={startWizard}
            variant="outlined"
            startIcon={<span className="material-icons">auto_fix_high</span>}
            sx={{
              mt: '16px',
              textTransform: 'none',
              borderRadius: '20px',
              px: '20px',
              borderColor: '#1A73E8',
              color: '#1A73E8',
              fontFamily: 'Roboto',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'rgba(26, 115, 232, 0.04)',
                borderColor: '#1A73E8',
              }
            }}
          >
            Configurar mi negocio (Asistente)
          </Button>
        </Box>

        <Box sx={{ borderBottom: '1px solid #E0E0E0', mb: '24px' }} />

        {/* Form Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nombre */}
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
              NOMBRE
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                sx: { 
                  height: 56, borderRadius: '4px', 
                  fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124',
                  '& fieldset': { borderColor: '#DADCE0' }
                }
              }}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
              EMAIL
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={email}
              disabled
              InputProps={{
                sx: { 
                  height: 56, borderRadius: '4px', bgcolor: '#F1F3F4',
                  fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#BDBDBD',
                  cursor: 'not-allowed',
                  '&.Mui-disabled': { color: '#BDBDBD', '-webkit-text-fill-color': '#BDBDBD' },
                  '& fieldset': { borderColor: '#E0E0E0' },
                  '&.Mui-disabled fieldset': { borderColor: '#E0E0E0' }
                }
              }}
            />
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '11px', color: '#70757A', mt: '4px' }}>
              El email no se puede modificar
            </Typography>
          </Box>

          {/* Nueva Contraseña */}
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
              NUEVA CONTRASEÑA
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              placeholder="Dejar vacío para no cambiar"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              InputProps={{
                sx: { 
                  height: 56, borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124',
                  '& fieldset': { borderColor: '#DADCE0' }
                }
              }}
            />
          </Box>

          {/* Confirmar Contraseña */}
          <Box>
            <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '12px', color: '#70757A', textTransform: 'uppercase', mb: '4px' }}>
              CONFIRMAR CONTRASEÑA
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={!!passwordError}
              InputProps={{
                sx: { 
                  height: 56, borderRadius: '4px',
                  fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124',
                  '& fieldset': { borderColor: passwordError ? '#D93025' : '#DADCE0' }
                }
              }}
            />
            {passwordError && (
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '12px', color: '#D93025', mt: '4px' }}>
                {passwordError}
              </Typography>
            )}
          </Box>

        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            height: 44, bgcolor: '#1A73E8', color: 'white',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px',
            textTransform: 'uppercase', borderRadius: '4px', mt: '24px',
            '&:hover': { bgcolor: '#1557B0' },
            '&.Mui-disabled': { bgcolor: '#1A73E8', color: 'white', opacity: 0.7 }
          }}
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </Button>
      </Box>

    </Box>
  );
}
