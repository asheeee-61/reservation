import { useState, useEffect } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const formatter = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getSpainTime() {
  const parts = formatter.formatToParts(new Date());
  const get = (type) => parts.find(p => p.type === type).value;
  return `${get('hour')}:${get('minute')}`;
}

export default function ServerClock() {
  const [time, setTime] = useState(getSpainTime);

  useEffect(() => {
    const id = setInterval(() => setTime(getSpainTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Tooltip
      title="Hora del servidor (España)"
      placement="bottom"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: '#323232', color: 'white',
            fontFamily: 'Roboto', fontSize: '12px',
            borderRadius: '4px', p: '6px 8px',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          height: 36, px: '10px', borderRadius: '4px',
          border: '1px solid #DADCE0', bgcolor: '#F8F9FA',
          cursor: 'default', userSelect: 'none', flexShrink: 0,
        }}
      >
        <span className="material-icons" style={{ fontSize: 15, color: '#5F6368' }}>
          schedule
        </span>
        <Typography
          sx={{
            fontFamily: 'Roboto, monospace',
            fontSize: 13,
            fontWeight: 500,
            color: '#202124',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.3px',
          }}
        >
          {time}
        </Typography>
      </Box>
    </Tooltip>
  );
}
