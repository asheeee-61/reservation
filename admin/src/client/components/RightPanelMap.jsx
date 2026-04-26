import { Box } from '@mui/material';
import { useReservationStore } from '../store/useReservationStore';

export default function RightPanelMap() {
  const { config } = useReservationStore();

  if (!config?.business) return null;

  const { lat, lng } = config.business;
  
  // The user requested a specific Google Maps embed for HECHIZO HOOKAH LOUNGE
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d342.4059724275721!2d-1.2169925499025762!3d37.961620533919124!2m3!1f339.5625!2f42.53161403572894!3f0!3m2!1i1024!2i768!4f35!3m3!1m2!1s0xd648004635ee803%3A0x919bf2fb4d68b4d!2sHECHIZO%20HOOKAH%20LOUNGE!5e0!3m2!1sen!2sma!4v1776979647197!5m2!1sen!2sma";

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
        style={{ border: 0, display: 'block' }}
        src={mapUrl}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Box>
  );
}
