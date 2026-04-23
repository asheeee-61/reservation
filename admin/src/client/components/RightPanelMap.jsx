import { Box } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function RightPanelMap() {
  const { config } = useReservationStore();

  if (!config?.business) return null;

  const { lat, lng } = config.business;
  
  // Create Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=18&t=k&output=embed`;

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
