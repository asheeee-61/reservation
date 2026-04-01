import { 
  Box, Typography, TextField, Button, Paper, 
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Email, Lock 
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../components/Toast/ToastContext';
import RestaurantLogo from '../../shared/RestaurantLogo';
import { apiClient } from '../../shared/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await apiClient('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.token) {
        login(data.token, data.user);
        toast.success('¡Bienvenido de nuevo!');
        navigate('/admin');
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 2 
    }}>
      <Paper elevation={0} sx={{ 
        p: { xs: 4, sm: 6 }, 
        width: '100%', 
        maxWidth: 420, 
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <RestaurantLogo restaurantName="Admin Panel" size={72} variant="square" />
          <Typography variant="h5" sx={{ mt: 3, fontWeight: 600, color: '#1A73E8' }}>
            Panel de Control
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Ingresa tus credenciales para continuar
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin} noValidate>
          <TextField 
            fullWidth 
            label="Correo Electrónico" 
            type="email" 
            variant="outlined"
            value={email} 
            onChange={e => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal" 
            required
            autoComplete="email"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" color={errors.email ? 'error' : 'action'} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <TextField 
            fullWidth 
            label="Contraseña" 
            type={showPassword ? 'text' : 'password'} 
            variant="outlined"
            value={password} 
            onChange={e => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal" 
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" color={errors.password ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              mt: 6, 
              py: 1.5, 
              borderRadius: 2, 
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(26, 115, 232, 0.2)',
              textTransform: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
          </Button>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              ¿Olvidaste tu contraseña? Contacta al soporte
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
