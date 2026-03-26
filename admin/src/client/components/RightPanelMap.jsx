import { Box } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function RightPanelMap() {
  const { config } = useReservationStore();

  if (!config?.restaurant) return null;

  const { lat, lng } = config.restaurant;
  
  // Create Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        bgcolor: '#f1f3f4'
      }}
    >
      <iframe
        title="Restaurant Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0, display: 'block' }}
        src={mapUrl}
        allowFullScreen
      />
    </Box>
  );
}
