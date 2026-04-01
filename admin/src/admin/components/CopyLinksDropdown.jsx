import { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSettingsStore } from '../store/useSettingsStore';

export default function CopyLinksDropdown() {
  const [open, setOpen] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const ref = useRef(null);
  const globalHours = useSettingsStore(state => state.globalHours);
  const googleMapsLink = globalHours?.google_maps_link || '';
  const reservationLink = globalHours?.reservation_link || '';
  const menuPdfUrl = globalHours?.menu_pdf_url || '';

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = async (url, type) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
    setOpen(false);
  };

  const items = [
    {
      label: 'Copiar enlace Google Maps',
      icon: 'location_on',
      url: googleMapsLink,
      type: 'maps',
    },
    {
      label: 'Copiar enlace de reserva',
      icon: 'link',
      url: reservationLink || window.location.origin + '/reservacion',
      type: 'reservation',
    },
    {
      label: 'Copiar enlace del menú',
      icon: 'menu_book',
      url: menuPdfUrl,
      type: 'menu',
    },
  ];

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Button
        variant="outlined"
        disableElevation
        onClick={() => setOpen(o => !o)}
        startIcon={<span className="material-icons" style={{ fontSize: 18 }}>content_copy</span>}
        sx={{
          border: '1px solid #DADCE0', color: '#202124', bgcolor: '#FFFFFF',
          height: 36, px: '16px', borderRadius: '4px',
          fontFamily: 'Roboto', fontSize: 14, fontWeight: 500,
          textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: 'none',
          '&:hover': { bgcolor: '#F1F3F4', border: '1px solid #DADCE0' },
        }}
      >
        Copiar
      </Button>

      {open && (
        <Box sx={{
          position: 'absolute', top: '44px', right: 0,
          width: 260, bgcolor: '#FFFFFF',
          border: '1px solid #E0E0E0', borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)', zIndex: 1300, py: '4px',
        }}>
          {items.map(item => {
            const hasValue = !!item.url;
            const isCopied = copiedType === item.type;
            return (
              <Box
                key={item.type}
                onClick={() => hasValue && handleCopy(item.url, item.type)}
                sx={{
                  display: 'flex', alignItems: 'center', height: 40, px: '12px', gap: '12px',
                  cursor: hasValue ? 'pointer' : 'default',
                  opacity: hasValue ? 1 : 0.4,
                  bgcolor: isCopied ? '#E6F4EA' : 'transparent',
                  '&:hover': hasValue ? { bgcolor: isCopied ? '#E6F4EA' : '#F1F3F4' } : {},
                }}
              >
                <span className="material-icons" style={{
                  fontSize: 18,
                  color: isCopied ? '#1E8E3E' : '#70757A',
                }}>
                  {isCopied ? 'check' : item.icon}
                </span>
                <Typography sx={{
                  fontFamily: 'Roboto', fontSize: 14,
                  color: isCopied ? '#1E8E3E' : '#202124',
                }}>
                  {isCopied ? 'Copiado' : item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
