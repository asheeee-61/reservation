import { Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const STATUS_COLORS = {
  'pending': { bg: '#FEF7E0', text: '#7D4A00' },
  'confirmed': { bg: '#E6F4EA', text: '#137333' },
  'cancelled': { bg: '#FDECEA', text: '#C5221F' },
  'no_show': { bg: '#FDECEA', text: '#C5221F' }
};

export default function ViewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const resData = location.state?.reservation || {};
  const statusKey = resData.status?.toLowerCase() || 'pending';
  const statusColors = STATUS_COLORS[statusKey] || { bg: '#F1F3F4', text: '#202124' };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ width: '100%', bgcolor: '#F1F3F4', minHeight: '100vh', boxSizing: 'border-box' }}>
      <Box sx={{ width: '100%', p: '24px', boxSizing: 'border-box' }}>
        
        {/* TOP BAR */}
        <Box sx={{ mb: '24px' }}>
          <Button 
            startIcon={<span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>} 
            onClick={() => navigate('/reservations')} 
            disableRipple
            sx={{ 
              color: '#1A73E8', textTransform: 'uppercase', fontFamily: 'Roboto', 
              fontWeight: 500, fontSize: '13px', letterSpacing: '1.25px', padding: 0,
              minWidth: 0, 
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            BACK TO RESERVATIONS
          </Button>
        </Box>

        {/* TWO COLUMN LAYOUT */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '24px' }}>
          
          {/* MAIN CARD (flex: 1) */}
          <Paper sx={{ flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
            
            {/* Card Header */}
            <Box sx={{ px: '24px', py: '20px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '20px', color: '#202124' }}>
                Reserva #{resData.reservation_id || id}
              </Typography>
              <Box sx={{ bgcolor: statusColors.bg, color: statusColors.text, borderRadius: '4px', px: '12px', py: '6px' }}>
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'capitalize' }}>
                  {resData.status || 'Pending'}
                </Typography>
              </Box>
            </Box>

            {/* Card Body */}
            <Box sx={{ p: '24px' }}>
              
              {/* Section 1 - Detalles */}
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '16px' }}>
                Detalles de la reserva
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <Box sx={{ pb: '20px', borderBottom: '1px solid #E0E0E0', pr: '12px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Fecha y hora</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.date || 'N/A'} · {resData.time || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ pb: '20px', borderBottom: '1px solid #E0E0E0', pl: '12px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Número de personas</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.guests || 0} personas
                  </Typography>
                </Box>
                
                <Box sx={{ pb: '20px', pt: '20px', pr: '12px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Sala</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px' }}>
                    {resData.table_type || 'General'}
                  </Typography>
                </Box>
                <Box sx={{ pb: '20px', pt: '20px', pl: '12px' }}>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Estado</Typography>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px', color: '#202124', mt: '4px', textTransform: 'capitalize' }}>
                    {resData.status || 'Pending'}
                  </Typography>
                </Box>
              </Box>

              {/* Section 2 - Notas especiales */}
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '11px', color: '#70757A', textTransform: 'uppercase', letterSpacing: '1.5px', mt: '8px', mb: '16px' }}>
                Notas especiales
              </Typography>
              <Box sx={{ bgcolor: '#F8F9FA', borderRadius: '4px', p: '12px' }}>
                {resData.special_requests ? (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#202124' }}>
                    {resData.special_requests}
                  </Typography>
                ) : (
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', fontStyle: 'italic' }}>
                    Sin peticiones especiales
                  </Typography>
                )}
              </Box>

              {/* Card Footer */}
              <Box sx={{ borderTop: '1px solid #E0E0E0', pt: '16px', mt: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                 <Button 
                   variant="outlined"
                   sx={{ height: 36, borderRadius: '4px', border: '1px solid #D93025', color: '#D93025', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', px: '16px' }}
                 >
                   Cancelar Reserva
                 </Button>
                 <Button 
                   variant="contained"
                   onClick={() => navigate(`/reservations/edit/${resData.id}`, { state: { reservation: resData } })}
                   disabled={!resData.id}
                   sx={{ height: 36, borderRadius: '4px', bgcolor: '#1A73E8', color: '#FFFFFF', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', boxShadow: 'none', px: '16px', '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' } }}
                 >
                   <span className="material-icons" style={{ fontSize: 16, marginRight: 8 }}>edit</span>
                   Editar Reserva
                 </Button>
              </Box>

            </Box>
          </Paper>

          {/* SIDE CARD (320px) */}
          <Paper sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', alignSelf: 'flex-start' }}>
            
            {/* Section 1 - Cliente */}
            <Typography sx={{ px: '20px', py: '16px', borderBottom: '1px solid #E0E0E0', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Cliente
            </Typography>
            <Box sx={{ p: '20px' }}>
              {resData.customer?.name ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#E8F0FE', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#1A73E8' }}>
                        {getInitials(resData.customer.name)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
                        {resData.customer.name}
                      </Typography>
                      {resData.customer.email && (
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                          {resData.customer.email}
                        </Typography>
                      )}
                      {resData.customer.phone && (
                        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                          {resData.customer.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button 
                    disableRipple
                    sx={{ mt: '16px', p: 0, minWidth: 0, color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'none', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                  >
                    Ver perfil completo →
                  </Button>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="material-icons" style={{ fontSize: 32, color: '#BDBDBD' }}>person_off</span>
                  <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', color: '#70757A', mt: '8px', textAlign: 'center' }}>
                    Sin cliente asignado
                  </Typography>
                  <Button 
                    variant="outlined"
                    sx={{ mt: '12px', height: 36, borderRadius: '4px', borderColor: '#1A73E8', color: '#1A73E8', fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', px: '16px' }}
                  >
                    Asignar Cliente
                  </Button>
                </Box>
              )}
            </Box>

            {/* Section 2 - Historial */}
            <Typography sx={{ px: '20px', py: '16px', borderTop: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0', fontFamily: 'Roboto', fontWeight: 500, fontSize: '14px', color: '#202124' }}>
              Actividad
            </Typography>
            <Box sx={{ p: '16px' }}>
              {resData.created_at ? (
                <Box sx={{ position: 'relative', pl: '16px' }}>
                  {/* Vertical Line */}
                  <Box sx={{ position: 'absolute', left: 3, top: 4, bottom: 4, width: '1px', bgcolor: '#E0E0E0' }} />
                  
                  {/* Event Node */}
                  <Box sx={{ position: 'relative', mb: '16px' }}>
                    <Box sx={{ position: 'absolute', left: '-16px', top: '5px', width: 8, height: 8, borderRadius: '50%', bgcolor: '#1A73E8' }} />
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#202124' }}>
                      Reserva creada
                    </Typography>
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '11px', color: '#70757A' }}>
                      {resData.created_at}
                    </Typography>
                  </Box>
                  
                  {/* Mock Event 2 (shows how list handles gap) */}
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: '-16px', top: '5px', width: 8, height: 8, borderRadius: '50%', bgcolor: '#1A73E8' }} />
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#202124' }}>
                      Estado cambiado a {resData.status || 'Pending'}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '11px', color: '#70757A' }}>
                      {resData.created_at}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography sx={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '13px', color: '#70757A' }}>
                  Sin actividad registrada
                </Typography>
              )}
            </Box>

          </Paper>

        </Box>
      </Box>
    </Box>
  );
}
