import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ReservationForm from '../components/ReservationForm';
import { apiClient } from '../services/apiClient';

export default function EditBooking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [resData, setResData] = useState(location.state?.reservation || null);
  const [loading, setLoading] = useState(!location.state?.reservation);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!resData) {
      setLoading(true);
      apiClient(`/admin/reservations/${id}`)
        .then(data => setResData(data))
        .catch(err => setErrorMsg(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, resData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{errorMsg}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: '24px', mx: 'auto', p: { xs: '16px', md: '24px' }, width: '100%', boxSizing: 'border-box' }}>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '24px', color: '#202124' }}>
        Editar reserva #{resData?.reservation_id || id}
      </Typography>
      <ReservationForm 
        compact={false} 
        initialData={resData}
        onSuccess={() => navigate('/admin/reservations')} 
        onCancel={() => navigate('/admin/reservations')} 
      />
    </Box>
  );
}
