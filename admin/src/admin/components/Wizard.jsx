import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, IconButton, 
  Paper, Portal, Fade 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWizardStore } from '../store/useWizardStore';

const STEPS = [
  {
    title: '¡Bienvenido al Asistente!',
    description: 'Te guiaremos a través de los pasos esenciales para configurar tu negocio. Es rápido y sencillo.',
    path: '/admin/profile',
    anchorId: 'wizard-start-btn',
    position: 'bottom',
  },
  {
    title: 'Identidad del Negocio',
    description: 'Aquí puedes configurar el logo, nombre y dirección de tu negocio.',
    path: '/admin/settings',
    anchorId: 'wizard-identity',
    position: 'right',
  },
  {
    title: 'Contacto y Enlaces',
    description: 'Configura tu WhatsApp, Instagram y enlaces de reserva para tus clientes.',
    path: '/admin/settings',
    anchorId: 'wizard-contact',
    position: 'right',
  },
  {
    title: 'Horario Global',
    description: 'Establece los límites generales de horario para tu negocio.',
    path: '/admin/settings',
    anchorId: 'wizard-global-hours',
    position: 'top',
  },
  {
    title: 'Zonas',
    description: 'Crea las áreas de tu negocio (ej: Terraza, Salón, Barra).',
    path: '/admin/zones',
    anchorId: 'wizard-add-zone',
    position: 'bottom',
  },
  {
    title: 'Eventos',
    description: 'Configura eventos especiales o categorías de reserva.',
    path: '/admin/events',
    anchorId: 'wizard-add-event',
    position: 'bottom',
  },
  {
    title: 'Control de Horarios',
    description: 'Define los turnos específicos y franjas horarias por día de la semana.',
    path: '/admin/schedule',
    anchorId: 'wizard-schedule-tabs',
    position: 'bottom',
  },
  {
    title: 'Buscador Global',
    description: 'Encuentra rápidamente cualquier reserva o cliente desde aquí.',
    path: '/admin',
    anchorId: 'wizard-header-search',
    position: 'bottom',
  },
  {
    title: 'Acciones Rápidas',
    description: 'Crea reservas o bloquea fechas rápidamente sin cambiar de página.',
    path: '/admin',
    anchorId: 'wizard-header-actions',
    position: 'bottom',
  },
  {
    title: 'Copiar Enlaces',
    description: 'Copia rápidamente el enlace de reserva o el link para tu biografía de Instagram.',
    path: '/admin',
    anchorId: 'wizard-header-copy',
    position: 'bottom',
  },
  {
    title: 'Estado del Día',
    description: 'Cambia el estado de tu negocio (Abierto/Cerrado) para un día específico.',
    path: '/admin',
    anchorId: 'wizard-header-daystatus',
    position: 'bottom',
  },
  {
    title: 'Estado de WhatsApp',
    description: 'Monitoriza la conexión con WhatsApp para asegurar el envío de notificaciones.',
    path: '/admin',
    anchorId: 'wizard-header-whatsapp',
    position: 'bottom',
  },
  {
    title: '¡Todo listo!',
    description: 'Has completado la configuración básica. Ya puedes empezar a recibir reservas.',
    path: '/admin',
    anchorId: null,
    position: 'center',
  },
];

export default function Wizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, currentStep, nextStep, prevStep, closeWizard, completeWizard } = useWizardStore();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const step = STEPS[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    if (location.pathname !== step.path) {
      navigate(step.path);
    }

    const findAnchor = () => {
      if (!step.anchorId) {
        setAnchorEl(null);
        setSpotlightRect(null);
        return;
      }
      const el = document.getElementById(step.anchorId);
      if (el) {
        setAnchorEl(el);
        const rect = el.getBoundingClientRect();
        setSpotlightRect(rect);
        
        // Ensure the element is in view for the spotlight
        if (currentStep > 0) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTimeout(findAnchor, 500);
      }
    };

    // Initial find
    setTimeout(findAnchor, 300); // Give time for navigation/rendering

    // Update spotlight on scroll or resize
    const handleScroll = () => {
      const el = document.getElementById(step.anchorId);
      if (el) setSpotlightRect(el.getBoundingClientRect());
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, currentStep, location.pathname, step.path, step.anchorId, navigate]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      completeWizard();
    } else {
      nextStep();
    }
  };

  const getPositionStyles = () => {
    if (!anchorEl || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000,
      };
    }

    const rect = anchorEl.getBoundingClientRect();
    const margin = 20;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        top = rect.top;
        left = rect.right + margin;
        break;
      case 'left':
        top = rect.top;
        left = rect.left - tooltipWidth - margin;
        break;
      default:
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
    }

    // Bounds checking
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));

    return {
      position: 'fixed',
      top,
      left,
      zIndex: 2000,
    };
  };

  return (
    <>
      {/* Premium Spotlight Backdrop */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1990, pointerEvents: 'auto',
        background: spotlightRect 
          ? `radial-gradient(circle at ${spotlightRect.left + spotlightRect.width/2}px ${spotlightRect.top + spotlightRect.height/2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height)/2 + 4}px, rgba(0,0,0,0.7) ${Math.max(spotlightRect.width, spotlightRect.height)/2 + 40}px)`
          : 'rgba(0,0,0,0.7)',
        transition: 'background 0.3s ease'
      }} onClick={closeWizard} />

      <Fade in={isOpen}>
        <Paper 
          elevation={12}
          sx={{
            ...getPositionStyles(),
            width: 320,
            p: '24px',
            borderRadius: '12px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E8EAED',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ 
                width: 32, height: 32, borderRadius: '50%', 
                bgcolor: '#E8F0FE', display: 'flex', 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#1A73E8' }}>auto_fix_high</span>
              </Box>
              <Typography sx={{ fontFamily: 'Roboto', fontWeight: 600, fontSize: '15px', color: '#202124' }}>
                {step.title}
              </Typography>
            </Box>
            <IconButton size="small" onClick={closeWizard} sx={{ color: '#5F6368' }}>
              <span className="material-icons" style={{ fontSize: 20 }}>close</span>
            </IconButton>
          </Box>

          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', color: '#5F6368', lineHeight: 1.6 }}>
            {step.description}
          </Typography>

          <Box sx={{ mt: 1 }}>
            {/* Progress bar */}
            <Box sx={{ width: '100%', height: 4, bgcolor: '#F1F3F4', borderRadius: 2, mb: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                width: `${((currentStep + 1) / STEPS.length) * 100}%`, 
                height: '100%', bgcolor: '#1A73E8', transition: 'width 0.3s ease' 
              }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#70757A', fontWeight: 500 }}>
                {currentStep + 1} / {STEPS.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                {currentStep > 0 && (
                  <Button 
                    size="small" 
                    onClick={prevStep}
                    sx={{ 
                      textTransform: 'none', fontFamily: 'Roboto', 
                      fontWeight: 500, color: '#70757A',
                      '&:hover': { bgcolor: '#F1F3F4' }
                    }}
                  >
                    Atrás
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleNext}
                  sx={{ 
                    textTransform: 'none', fontFamily: 'Roboto', fontWeight: 500, bgcolor: '#1A73E8',
                    px: '16px', borderRadius: '6px',
                    boxShadow: 'none', '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.1)', bgcolor: '#1557B0' }
                  }}
                >
                  {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
