import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from './config';
import './App.css';

export default function App() {
  const glowRef   = useRef(null);
  const activeRef = useRef(false);

  const [navStack, setNavStack]         = useState(null);   // null = loading/error
  const [loading,  setLoading]          = useState(true);
  const [error,    setError]            = useState(null);
  const [resource, setResource]         = useState(null);   // { type, url, label }

  // ── Mouse glow ────────────────────────────────────────────────────────────
  useEffect(() => {
    const glow = glowRef.current;
    const onMove = (e) => {
      if (!activeRef.current) { glow.style.opacity = '1'; activeRef.current = true; }
      requestAnimationFrame(() => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
    };
    const onLeave = () => { glow.style.opacity = '0'; activeRef.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); };
  }, []);

  // ── Fetch menu ────────────────────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      if (!res.ok) throw new Error('Error al cargar el menú');
      const data = await res.json();
      setNavStack([data]);
    } catch (e) {
      setError(e.message || 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const currentLevel = navStack?.[navStack.length - 1] ?? [];

  const handleItemClick = useCallback((e, item) => {
    if (!item.is_active) return;
    const el = e.currentTarget;
    el.style.transform = 'translateY(2px) translateZ(10px) scale(0.98)';
    setTimeout(() => {
      el.style.transform = '';
      if (item.children?.length > 0) {
        setNavStack(prev => [...prev, item.children]);
      } else if (item.resource_type && item.resource_url) {
        setResource({ type: item.resource_type, url: item.resource_url, label: item.label });
      }
    }, 180);
  }, []);

  const handleBack = useCallback(() => {
    setNavStack(prev => prev.slice(0, -1));
  }, []);

  const handleKeyDown = useCallback((e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(e, item);
    }
  }, [handleItemClick]);

  return (
    <main className="scene">
      <div className="noise"    aria-hidden="true" />
      <div className="velvet"   aria-hidden="true" />
      <div className="spotlight" aria-hidden="true" />
      <div className="glow-point" ref={glowRef} aria-hidden="true" />

      <div className="smoke-container" aria-hidden="true">
        <div className="smoke-puff" />
        <div className="smoke-puff" />
        <div className="smoke-puff" />
      </div>

      <div className="leaves" aria-hidden="true">
        <div className="leaf leaf-1" />
        <div className="leaf leaf-2" />
      </div>

      {/* Back button */}
      {navStack && navStack.length > 1 && (
        <button className="back-btn" onClick={handleBack} aria-label="Volver">
          ← VOLVER
        </button>
      )}

      <section className="content" aria-labelledby="main-heading">
        <header className="brand">
          <h1 className="title" id="main-heading">HECHIZO</h1>
          <div className="subtitle">Hookah Lounge</div>
        </header>

        <div className="divider" aria-hidden="true" />

        {loading && (
          <div className="menu-state" aria-label="Cargando menú">
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="menu-state menu-state--error">
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchMenu}>REINTENTAR</button>
          </div>
        )}

        {!loading && !error && (
          <nav className="menu" aria-label="Menú principal">
            {currentLevel.map((item, i) => (
              <div
                key={item.id}
                className={[
                  'menu-item',
                  !item.is_active              ? 'menu-item--inactive' : '',
                  item.children?.length > 0    ? 'menu-item--parent'  : '',
                ].filter(Boolean).join(' ')}
                role="button"
                tabIndex={item.is_active ? 0 : -1}
                aria-disabled={!item.is_active}
                style={{ '--delay': `${0.6 + i * 0.1}s` }}
                onClick={e => handleItemClick(e, item)}
                onKeyDown={e => handleKeyDown(e, item)}
              >
                <span>{item.label}</span>
                {item.children?.length > 0 && (
                  <span className="item-arrow" aria-hidden="true">›</span>
                )}
              </div>
            ))}
          </nav>
        )}
      </section>

      <footer className="footer-text">ESENCIA PREMIUM</footer>

      {/* Resource overlay */}
      {resource && (
        <div className="resource-overlay" role="dialog" aria-modal="true" aria-label={resource.label}>
          <button className="resource-close" onClick={() => setResource(null)} aria-label="Cerrar">✕</button>
          {resource.type === 'pdf' && (
            <embed src={resource.url} type="application/pdf" className="resource-embed" />
          )}
          {resource.type === 'image' && (
            <img src={resource.url} alt={resource.label} className="resource-img" />
          )}
          {resource.type === 'video' && (
            <video src={resource.url} controls autoPlay className="resource-video" />
          )}
        </div>
      )}
    </main>
  );
}
