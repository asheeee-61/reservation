import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      '100vh',
      background:     '#F1F3F4',
      textAlign:      'center',
      padding:        24,
    }}>
      <span 
        className="material-icons"
        style={{ fontSize: 72, color: '#BDBDBD' }}
      >
        search_off
      </span>
      <h1 style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   48,
        fontWeight: 400,
        color:      '#202124',
        margin:     '16px 0 8px',
      }}>
        404
      </h1>
      <h2 style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   20,
        fontWeight: 400,
        color:      '#5F6368',
        margin:     '0 0 8px',
      }}>
        Página no encontrada
      </h2>
      <p style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize:   14,
        color:      '#9AA0A6',
        maxWidth:   360,
        lineHeight: 1.6,
        margin:     '0 0 32px',
      }}>
        La página que buscas no existe o ha sido 
        movida. Comprueba la URL o vuelve al inicio.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background:   'transparent',
            color:        '#1A73E8',
            border:       '1px solid #1A73E8',
            borderRadius: 4,
            padding:      '10px 24px',
            fontSize:     14,
            fontFamily:   'Roboto, sans-serif',
            fontWeight:   500,
            cursor:       'pointer',
          }}
        >
          VOLVER ATRÁS
        </button>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
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
          IR AL INICIO
        </button>
      </div>
    </div>
  )
}
