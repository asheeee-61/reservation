import { useSmartBack } from '../hooks/useSmartBack'

export function BackButton({ 
  label    = 'VOLVER',
  fallback = '/admin/dashboard',
}) {
  const goBack = useSmartBack(fallback)

  return (
    <button
      onClick={goBack}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         6,
        background:  'transparent',
        border:      'none',
        padding:     0,
        cursor:      'pointer',
        fontFamily:  'Roboto, sans-serif',
        fontSize:    13,
        fontWeight:  500,
        color:       '#1A73E8',
        textTransform: 'uppercase',
        letterSpacing: '1.25px',
        marginBottom: 24,
      }}
    >
      <span className="material-icons" 
            style={{ fontSize: 16 }}>
        arrow_back
      </span>
      {label}
    </button>
  )
}
