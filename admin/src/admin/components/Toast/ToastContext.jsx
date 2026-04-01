import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const TOAST_TYPES = {
  success: {
    bg:     '#323232',
    icon:   'check_circle',
    color:  '#34A853',
  },
  error: {
    bg:     '#323232',
    icon:   'error',
    color:  '#EA4335',
  },
  warning: {
    bg:     '#323232',
    icon:   'warning',
    color:  '#F9AB00',
  },
  info: {
    bg:     '#323232',
    icon:   'info',
    color:  '#1A73E8',
  },
  whatsapp: {
    bg:     '#323232',
    icon:   'whatsapp',
    color:  '#25D366',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, exiting: true } : t
    ))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300) // match exit animation duration
  }, [])

  const toast = useCallback((
    message, 
    type    = 'success', 
    duration = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    
    setToasts(prev => [
      ...prev.slice(-4), // max 5 toasts at once
      { id, message, type, exiting: false }
    ])

    if (duration > 0) {
      timers.current[id] = setTimeout(() => {
        dismiss(id)
        delete timers.current[id]
      }, duration)
    }

    return id
  }, [dismiss])

  // Shorthand methods
  toast.success  = (msg, dur) => toast(msg, 'success',  dur)
  toast.error    = (msg, dur) => toast(msg, 'error',    dur || 4000)
  toast.warning  = (msg, dur) => toast(msg, 'warning',  dur)
  toast.info     = (msg, dur) => toast(msg, 'info',     dur)
  toast.whatsapp = (msg, dur) => toast(msg, 'whatsapp', dur)

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onDismiss={dismiss} 
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error(
    'useToast must be used inside ToastProvider'
  )
  return ctx
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  
  return (
    <div style={{
      position:      'fixed',
      bottom:        24,
      left:          '50%',
      transform:     'translateX(-50%)',
      zIndex:        9999,
      display:       'flex',
      flexDirection: 'column',
      gap:           8,
      alignItems:    'center',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem 
          key={t.id} 
          toast={t} 
          onDismiss={onDismiss} 
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const config = TOAST_TYPES[toast.type] 
              || TOAST_TYPES.success

  return (
    <div
      style={{
        background:    config.bg,
        color:         'white',
        borderRadius:  4,
        padding:       '12px 16px',
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        minWidth:      280,
        maxWidth:      480,
        boxShadow:     '0 3px 8px rgba(0,0,0,0.3)',
        pointerEvents: 'all',
        animation:     toast.exiting 
          ? 'toast-exit 300ms ease forwards'
          : 'toast-enter 300ms ease',
        cursor:        'pointer',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <span 
        className="material-icons"
        style={{ 
          color:    config.color, 
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </span>
      <span style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   14,
        flex:       1,
        lineHeight: 1.4,
      }}>
        {toast.message}
      </span>
      <span 
        className="material-icons"
        style={{ 
          color:    'rgba(255,255,255,0.5)', 
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        close
      </span>
    </div>
  )
}
