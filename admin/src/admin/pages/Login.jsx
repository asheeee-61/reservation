import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/');
      } else {
        alert(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F1F3F4' }}>
      <Paper sx={{ p: 8, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField 
            fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            margin="normal" required
          />
          <TextField 
            fullWidth label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)}
            margin="normal" required
          />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 6 }}>
            INICIAR SESIÓN
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
