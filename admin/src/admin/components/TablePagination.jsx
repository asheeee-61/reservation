import { Box, Typography, Select, MenuItem, IconButton } from '@mui/material';

/**
 * MD2 Table Pagination Component
 *
 * Props:
 *   meta        — { current_page, last_page, per_page, total }
 *   page        — current page number (int)
 *   perPage     — rows per page (int)
 *   onPageChange(newPage)     — callback
 *   onPerPageChange(newPer)   — callback (resets page to 1 internally via parent)
 */
export default function TablePagination({ meta, page, perPage, onPageChange, onPerPageChange }) {
  if (!meta || meta.total === 0) return null;

  const start = (meta.current_page - 1) * meta.per_page + 1;
  const end   = Math.min(meta.current_page * meta.per_page, meta.total);
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= meta.last_page;

  const arrowSx = (disabled) => ({
    width: 28,
    height: 28,
    borderRadius: '4px',
    border: `1px solid ${disabled ? '#E0E0E0' : '#DADCE0'}`,
    bgcolor: disabled ? 'transparent' : '#FFFFFF',
    color: disabled ? '#BDBDBD' : '#70757A',
    cursor: disabled ? 'not-allowed' : 'pointer',
    p: 0,
    '&:hover': disabled ? {} : { bgcolor: '#F1F3F4' },
    '&.Mui-disabled': { color: '#BDBDBD', border: '1px solid #E0E0E0' },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '16px',
        px: '8px',
        py: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* Rows per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography
          sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', whiteSpace: 'nowrap' }}
        >
          Filas por página:
        </Typography>
        <Select
          size="small"
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          variant="outlined"
          sx={{
            height: 28,
            fontFamily: 'Roboto',
            fontSize: '14px',
            color: '#70757A',
            borderRadius: '4px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DADCE0' },
            '& .MuiSelect-select': { py: '4px', pr: '28px !important', pl: '8px' },
          }}
        >
          <MenuItem value={10} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>10</MenuItem>
          <MenuItem value={25} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>25</MenuItem>
          <MenuItem value={50} sx={{ fontFamily: 'Roboto', fontSize: '14px' }}>50</MenuItem>
        </Select>
      </Box>

      {/* Range label */}
      <Typography
        sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', whiteSpace: 'nowrap' }}
      >
        {start}–{end} de {meta.total}
      </Typography>

      {/* Previous */}
      <IconButton
        disabled={isPrevDisabled}
        onClick={() => !isPrevDisabled && onPageChange(page - 1)}
        sx={arrowSx(isPrevDisabled)}
        disableRipple={isPrevDisabled}
      >
        <span className="material-icons" style={{ fontSize: 18 }}>chevron_left</span>
      </IconButton>

      {/* Next */}
      <IconButton
        disabled={isNextDisabled}
        onClick={() => !isNextDisabled && onPageChange(page + 1)}
        sx={arrowSx(isNextDisabled)}
        disableRipple={isNextDisabled}
      >
        <span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span>
      </IconButton>
    </Box>
  );
}
