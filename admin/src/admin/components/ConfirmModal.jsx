import { Dialog, Typography, Box, Button, TextField } from '@mui/material';

export function ConfirmModal({ 
  open, title, body, confirmLabel, 
  confirmColor = '#D93025', confirmDisabled, 
  onCancel, onConfirm,
  showInput = false, inputValue = '', onInputChange, inputPlaceholder = 'Motivo...'
}) {
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

      {showInput && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '4px' },
              '& .MuiInputBase-input': { fontFamily: 'Roboto', fontSize: '14px' }
            }}
          />
        </Box>
      )}

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
          CANCELAR
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled || (showInput && !inputValue.trim())}
          disableElevation
          sx={{
            height: 36, px: '24px', borderRadius: '4px',
            bgcolor: confirmColor, color: '#FFFFFF',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': { bgcolor: confirmColor, filter: 'brightness(0.9)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: '#F1F3F4', color: '#BDBDBD' }
          }}
        >
          {confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
