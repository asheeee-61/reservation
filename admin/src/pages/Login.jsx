import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for now
    login('fake-jwt-token', { name: 'Admin User', email: email });
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Admin Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField 
            fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            margin="normal" required
          />
          <TextField 
            fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            margin="normal" required
          />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 3, py: 1.5, borderRadius: 8 }}>
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
