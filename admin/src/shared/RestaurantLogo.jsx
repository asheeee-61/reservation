import { Box, Typography } from '@mui/material';

export default function RestaurantLogo({ logoUrl, restaurantName, size = 96, variant = 'circle' }) {
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (logoUrl) {
    return (
      <Box
        component="img"
        src={logoUrl}
        alt={restaurantName || 'Logo'}
        sx={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: variant === 'circle' ? '50%' : '8px',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: variant === 'circle' ? '50%' : '8px',
        bgcolor: '#1A73E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Roboto',
          fontWeight: 500,
          fontSize: size * 0.375,
          color: '#FFFFFF',
          lineHeight: 1,
        }}
      >
        {getInitials(restaurantName)}
      </Typography>
    </Box>
  );
}
