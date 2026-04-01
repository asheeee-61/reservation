import { useState, useCallback, useRef } from 'react'
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
  const [showTooltip, setShow] = useState(false)
  const [modal, setModal] = useState({ open: false, reason: '' })
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef(null)
  const toast = useToast()

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setShow(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false)
    }, 400) // 400ms delay to hide tooltip
  }

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
      <div
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Status indicator button */}
        <div
          onClick={handleToggle}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            height:         36,
            padding:        '0 10px',
            borderRadius:   4,
            cursor:         loading ? 'wait' : 'pointer',
            background:     showTooltip ? '#F1F3F4' : 'transparent',
            transition:     'background 200ms ease',
            position:       'relative',
          }}
        >
          <span className="material-icons" style={{ fontSize: 18, color: current.dot }}>
            {current.icon}
          </span>
          {/* colored dot badge */}
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

        {/* Tooltip */}
        {showTooltip && (
          <div style={{
            position:     'absolute',
            top:          'calc(100% + 8px)',
            right:        0,
            background:   '#323232',
            color:        'white',
            borderRadius: 4,
            padding:      '12px',
            whiteSpace:   'nowrap',
            zIndex:       1000,
            boxShadow:    '0 4px 12px rgba(0,0,0,0.3)',
            minWidth:     180,
          }}>
            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: current.dot, flexShrink: 0, display: 'block',
              }} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 500 }}>
                Estado del día: {current.label}
              </span>
            </div>
            <div style={{
              marginTop:    10,
              paddingTop:   10,
              borderTop:    '1px solid rgba(255,255,255,0.15)',
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle() }}
                disabled={loading}
                style={{
                  background:   current.btnNext === 'ABIERTO' ? '#34A853' : '#EA4335',
                  color:        'white',
                  border:       'none',
                  borderRadius: 4,
                  padding:      '6px 12px',
                  fontSize:     12,
                  fontWeight:   500,
                  cursor:       loading ? 'wait' : 'pointer',
                  width:        '100%',
                  fontFamily:   'Roboto, sans-serif',
                  textTransform: 'uppercase',
                }}
              >
                {current.btnLabel}
              </button>
            </div>
          </div>
        )}
      </div>

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
