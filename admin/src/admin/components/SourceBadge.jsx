import { Box, Typography } from '@mui/material';

const SOURCE_CONFIG = {
  'web':      { label: 'Web',     icon: 'language', color: '#1A73E8', bg: '#E8F0FE' },
  'manual':   { label: 'Manual',  icon: 'edit',     color: '#70757A', bg: '#F1F3F4' },
  'whatsapp': { label: 'WhatsApp', icon: 'chat',     color: '#25D366', bg: '#DCF8C6' }
};

export default function SourceBadge({ source }) {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG['web'];

  return (
    <Box sx={{ 
      display: 'inline-flex', alignItems: 'center', gap: '4px', 
      px: '8px', py: '2px', borderRadius: '4px', bgcolor: config.bg, color: config.color 
    }}>
      <span className="material-icons" style={{ fontSize: 14 }}>{config.icon}</span>
      <Typography sx={{ 
        fontFamily: 'Roboto', fontSize: '10px', fontWeight: 700, 
        textTransform: 'uppercase', letterSpacing: '0.5px' 
      }}>
        {config.label}
      </Typography>
    </Box>
  );
}
