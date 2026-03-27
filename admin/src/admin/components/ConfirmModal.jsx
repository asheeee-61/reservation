import { Dialog, Typography, Box, Button } from '@mui/material';

export function ConfirmModal({ open, title, body, confirmLabel, confirmColor = '#D93025', confirmDisabled, onCancel, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          width: '100%', maxWidth: 400,
          bgcolor: '#FFFFFF', borderRadius: '4px',
          p: '24px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          m: '16px',
        },
      }}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.4)' } } }}
    >
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124' }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mt: '8px' }}>
        {body}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', mt: '24px' }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={confirmDisabled}
          sx={{
            height: 36, px: '24px', borderRadius: '4px',
            border: '1px solid #DADCE0', color: '#70757A',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled}
          disableElevation
          sx={{
            height: 36, px: '24px', borderRadius: '4px',
            bgcolor: confirmColor, color: '#FFFFFF',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': { bgcolor: confirmColor, filter: 'brightness(0.9)', boxShadow: 'none' },
          }}
        >
          {confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
