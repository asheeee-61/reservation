export function EmptyState({ 
  icon    = 'inbox',
  title   = 'Sin resultados',
  message = 'No hay datos que mostrar.',
  action  = null, // { label, onClick }
}) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '64px 24px',
      textAlign:      'center',
    }}>
      <span 
        className="material-icons"
        style={{ fontSize: 48, color: '#BDBDBD' }}
      >
        {icon}
      </span>
      <h3 style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   16,
        fontWeight: 500,
        color:      '#5F6368',
        marginTop:  16,
        marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   14,
        color:      '#9AA0A6',
        maxWidth:   320,
        lineHeight: 1.5,
      }}>
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop:    24,
            background:   '#1A73E8',
            color:        'white',
            border:       'none',
            borderRadius: 4,
            padding:      '10px 24px',
            fontSize:     14,
            fontFamily:   'Roboto, sans-serif',
            fontWeight:   500,
            cursor:       'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
