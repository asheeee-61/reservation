export function ErrorState({ 
  message = 'Error al cargar los datos.',
  onRetry = null,
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
        style={{ fontSize: 48, color: '#EA4335' }}
      >
        error_outline
      </span>
      <p style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   14,
        color:      '#5F6368',
        marginTop:  16,
        maxWidth:   320,
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop:    16,
            background:   'transparent',
            color:        '#1A73E8',
            border:       '1px solid #1A73E8',
            borderRadius: 4,
            padding:      '8px 20px',
            fontSize:     13,
            fontFamily:   'Roboto, sans-serif',
            fontWeight:   500,
            cursor:       'pointer',
          }}
        >
          REINTENTAR
        </button>
      )}
    </div>
  )
}
