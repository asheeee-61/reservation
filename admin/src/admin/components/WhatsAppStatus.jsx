import { useState, useEffect, useCallback } from 'react'

const STATUS = {
  checking: {
    dot:     '#9E9E9E',  // grey
    label:   'Verificando WhatsApp...',
    pulse:   true,
  },
  connected: {
    dot:     '#34A853',  // green
    label:   'WhatsApp conectado',
    pulse:   false,
  },
  waiting_qr: {
    dot:     '#FBBC04',  // yellow
    label:   'WhatsApp esperando QR',
    pulse:   true,
  },
  disconnected: {
    dot:     '#FBBC04',  // yellow
    label:   'WhatsApp desconectado',
    pulse:   true,
  },
  unreachable: {
    dot:     '#EA4335',  // red
    label:   'Servicio de avisos caído',
    pulse:   true,
  },
}

import { CONFIG } from '../../config'

const NOTICE_URL = CONFIG.NOTICE_URL
const NOTICE_TOKEN = CONFIG.NOTICE_TOKEN

const POLL_INTERVAL = 30000 // check every 30 seconds

export default function WhatsAppStatus() {
  const [status, setStatus]     = useState('checking')
  const [showTooltip, setShow]  = useState(false)
  const [lastChecked, setLast]  = useState(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${NOTICE_URL}/health`, {
        signal: AbortSignal.timeout(5000) // 5s timeout
      })
      
      if (!res.ok) {
        setStatus('unreachable')
        return
      }

      const data = await res.json()

      if (data.whatsapp?.connected) {
        setStatus('connected')
      } else if (data.whatsapp?.waitingQr) {
        setStatus('waiting_qr')
      } else {
        setStatus('disconnected')
      }
    } catch (err) {
      // fetch failed — service is unreachable
      setStatus('unreachable')
    } finally {
      setLast(new Date())
    }
  }, [])

  // Check on mount + poll every 30s
  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [checkStatus])

  const current = STATUS[status]

  const formatLastChecked = () => {
    if (!lastChecked) return ''
    return lastChecked.toLocaleTimeString('es-ES', {
      hour:   '2-digit',
      minute: '2-digit',
    })
  }

  const handleInspect = () => {
    const url = `${NOTICE_URL}/monitoring?token=${NOTICE_TOKEN}`
    window.open(url, '_blank')
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* WhatsApp icon + dot */}
      <div
        style={{
          width:          36,
          height:         36,
          borderRadius:   '50%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          cursor:         'pointer',
          transition:     'background 200ms ease',
          background:     showTooltip ? '#F1F3F4' : 'transparent',
          position:       'relative',
        }}
        onClick={checkStatus} // manual refresh on click
      >
        {/* WhatsApp SVG icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={status === 'unreachable' ? '#EA4335' : status === 'disconnected' ? '#FBBC04' : '#25D366'}
          style={{ transition: 'fill 300ms ease' }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        {/* Status dot */}
        <span style={{
          position:     'absolute',
          bottom:       2,
          right:        2,
          width:        10,
          height:       10,
          borderRadius: '50%',
          background:   current.dot,
          border:       '2px solid white',
          animation:    current.pulse 
            ? 'wa-pulse 1.5s ease-in-out infinite' 
            : 'none',
        }} />
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
          minWidth:     200,
        }}>
          {/* Status row */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        8,
          }}>
            <span style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   current.dot,
              flexShrink:   0,
              display:      'block',
            }} />
            <span style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize:   13,
              fontWeight: 500,
            }}>
              {current.label}
            </span>
          </div>

          {/* Last checked */}
          {lastChecked && (
            <div style={{
              fontFamily:  'Roboto, sans-serif',
              fontSize:    11,
              color:       'rgba(255,255,255,0.6)',
              marginTop:   4,
            }}>
              Última verificación: {formatLastChecked()}
            </div>
          )}

          {/* Inspect button — always visible */}
          <div style={{
            marginTop:    12,
            paddingTop:   12,
            borderTop:    '1px solid rgba(255,255,255,0.15)',
            display:      'flex',
            flexDirection: 'column',
            gap:          8,
          }}>
            {status !== 'connected' && (
              <div style={{
                fontFamily:  'Roboto, sans-serif',
                fontSize:    11,
                color:       status === 'unreachable' ? '#EA4335' : '#FBBC04',
                lineHeight:  '1.4',
              }}>
                {status === 'waiting_qr' 
                  ? 'Vincule su dispositivo para enviar avisos.'
                  : status === 'unreachable'
                  ? 'El sistema de notificaciones no responde.'
                  : 'WhatsApp se ha desconectado.'
                }
              </div>
            )}
            <button
              onClick={handleInspect}
              style={{
                background:   '#1A73E8',
                color:        'white',
                border:       'none',
                borderRadius: 4,
                padding:      '6px 12px',
                fontSize:     12,
                fontWeight:   500,
                cursor:       'pointer',
                width:        '100%',
                fontFamily:   'Roboto, sans-serif',
              }}
            >
              Inspeccionar
            </button>
          </div>

          {/* Click to refresh hint */}
          {status === 'connected' && (
            <div style={{
              fontFamily:  'Roboto, sans-serif',
              fontSize:    10,
              color:       'rgba(255,255,255,0.4)',
              marginTop:   4,
              textAlign:   'center'
            }}>
              Clic para verificar ahora
            </div>
          )}
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes wa-pulse {
          0%   { opacity: 1;   transform: scale(1); }
          50%  { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
