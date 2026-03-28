import { Dialog, Drawer, useMediaQuery, useTheme, Box, IconButton, Typography } from '@mui/material';
import ReservationForm from './ReservationForm';

export default function ReservationFormModal({ open, onClose, reservationData, onSuccess }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F1F3F4' }}>
      <Box sx={{ p: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 10 }}>
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#202124' }}>
          {reservationData ? 'Editar reserva' : 'Nueva reserva'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#70757A' }}>
          <span className="material-icons">close</span>
        </IconButton>
      </Box>
      <Box sx={{ p: '24px', overflowY: 'auto' }}>
         <ReservationForm initialData={reservationData} compact={true} onSuccess={handleSuccess} onCancel={onClose} />
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
            minHeight: '70vh'
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
        sx: { borderRadius: '8px', bgcolor: '#F1F3F4', maxHeight: '85vh' } 
      }}
    >
      {content}
    </Dialog>
  );
}
