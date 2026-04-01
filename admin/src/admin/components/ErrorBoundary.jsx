import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        64,
          textAlign:      'center',
        }}>
          <span 
            className="material-icons"
            style={{ fontSize: 48, color: '#BDBDBD' }}
          >
            error_outline
          </span>
          <h2 style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize:   18,
            fontWeight: 500,
            color:      '#202124',
            marginTop:  16,
          }}>
            Algo ha ido mal
          </h2>
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize:   14,
            color:      '#70757A',
            marginTop:  8,
            maxWidth:   360,
          }}>
            Ha ocurrido un error inesperado. 
            Intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop:   24,
              background:  '#1A73E8',
              color:       'white',
              border:      'none',
              borderRadius:4,
              padding:     '10px 24px',
              fontSize:    14,
              fontFamily:  'Roboto, sans-serif',
              fontWeight:  500,
              cursor:      'pointer',
            }}
          >
            RECARGAR PÁGINA
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
