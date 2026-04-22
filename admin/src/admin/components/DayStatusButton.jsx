import { useState, useCallback } from 'react'
import { Dialog, Typography, Box, Button } from '@mui/material'
import { apiClient } from '../../shared/api'
import { useToast } from './Toast/ToastContext'
import { ConfirmModal } from './ConfirmModal'

const TODAY = new Date().toISOString().split('T')[0]

const DAY_STATUS_UI = {
  ABIERTO:   { bg: '#E6F4EA', text: '#137333', dot: '#34A853', label: 'Abierto',   icon: 'check_circle', btnLabel: 'Cerrar día',   btnNext: 'BLOQUEADO' },
  CERRADO:   { bg: '#FEF7E0', text: '#7D4A00', dot: '#FBBC04', label: 'Cerrado',   icon: 'pause_circle', btnLabel: 'Reabrir día',  btnNext: 'ABIERTO'   },
  BLOQUEADO: { bg: '#FDECEA', text: '#D93025', dot: '#EA4335', label: 'Bloqueado', icon: 'block',        btnLabel: 'Reabrir día',  btnNext: 'ABIERTO'   },
}

export default function DayStatusButton({ dayStatus, onStatusChange }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [modal, setModal] = useState({ open: false, reason: '' })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const current = DAY_STATUS_UI[dayStatus] || DAY_STATUS_UI.ABIERTO

  const doUpdate = useCallback(async (status, reason = null) => {
    setLoading(true)
    try {
      await apiClient('/admin/day-status', {
        method: 'PATCH',
        body: JSON.stringify({ date: TODAY, status, reason }),
      })
      onStatusChange?.(status)
      toast.success(`Día ${status.toLowerCase()}`)
    } catch {
      toast.error('Error al actualizar el estado del día')
    } finally {
      setLoading(false)
      setModal({ open: false, reason: '' })
    }
  }, [onStatusChange, toast])

  const handleToggle = () => {
    if (dayStatus === 'ABIERTO') {
      setModal({ open: true, reason: '' })
    } else {
      doUpdate('ABIERTO')
    }
  }

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        {/* Status indicator button */}
        <div
          onClick={() => setInfoOpen(true)}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            height:         36,
            padding:        '0 10px',
            borderRadius:   4,
            cursor:         'pointer',
            background:     infoOpen ? '#F1F3F4' : 'transparent',
            transition:     'background 200ms ease',
          }}
        >
          <span className="material-icons" style={{ fontSize: 18, color: current.dot }}>
            {current.icon}
          </span>
          <span style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize:   12,
            fontWeight: 500,
            color:      current.text,
            display:    'none',
          }} className="day-status-label">
            {current.label}
          </span>
        </div>
      </div>

      {/* Info Dialog instead of tooltip */}
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        PaperProps={{
          sx: {
            width: '100%', maxWidth: 300,
            bgcolor: '#FFFFFF', borderRadius: '4px',
            p: '24px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            m: '16px',
          },
        }}
      >
        <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '16px', color: '#202124', mb: 2 }}>
          Control del día
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: 3 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: current.dot, flexShrink: 0 }} />
          <Typography sx={{ fontFamily: 'Roboto', fontSize: '14px', fontWeight: 500, color: current.text }}>
            Estado actual: {current.label}
          </Typography>
        </Box>

        <Button
          onClick={() => {
            setInfoOpen(false);
            handleToggle();
          }}
          disabled={loading}
          variant="contained"
          fullWidth
          disableElevation
          sx={{
            height: 36, borderRadius: '4px',
            bgcolor: current.btnNext === 'ABIERTO' ? '#34A853' : '#D93025', 
            color: '#FFFFFF',
            fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase',
            '&:hover': { bgcolor: current.btnNext === 'ABIERTO' ? '#34A853' : '#D93025', filter: 'brightness(0.9)', boxShadow: 'none' }
          }}
        >
          {loading ? 'Cargando...' : current.btnLabel}
        </Button>
      </Dialog>

      {/* Close day confirmation modal */}
      <ConfirmModal
        open={modal.open}
        title="Cerrar día"
        body="¿Motivo del cierre? No se permitirán nuevas reservas web."
        showInput={true}
        inputValue={modal.reason}
        onInputChange={(val) => setModal(m => ({ ...m, reason: val }))}
        confirmLabel="CERRAR DÍA"
        onConfirm={() => doUpdate('BLOQUEADO', modal.reason)}
        onCancel={() => setModal({ open: false, reason: '' })}
      />
    </>
  )
}
