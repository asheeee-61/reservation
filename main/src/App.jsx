import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Document, Page, pdfjs } from 'react-pdf';
import './pdf-annotation-layer.css';
import './pdf-text-layer.css';
import { API_BASE_URL } from './config';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const flipVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '70%' : '-70%',
    rotateY: dir > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '-70%' : '70%',
    rotateY: dir > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.22, ease: [0.55, 0.06, 0.68, 0.19] },
  }),
};

function PdfViewer({ url, onClose }) {
  const [[page, direction], setPageState] = useState([1, 0]);
  const [numPages, setNumPages]           = useState(null);
  const [loading,  setPdfLoading]         = useState(true);
  const wrapperRef                        = useRef(null);
  const [pdfWidth, setPdfWidth]           = useState(() => Math.min(Math.floor(window.innerWidth * 0.92), 920));

  const paginate = useCallback((delta) => {
    setPageState(([p]) => {
      const next = p + delta;
      if (next < 1 || (numPages && next > numPages)) return [p, 0];
      return [next, delta];
    });
  }, [numPages]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => paginate(1),
    onSwipedRight: () => paginate(-1),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 40,
    swipeDuration: 500,
  });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPdfWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft')  paginate(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, paginate]);

  return (
    <div className="resource-overlay resource-overlay--pdf" role="dialog" aria-modal="true" aria-label="Visor de PDF">
      <button className="resource-close" onClick={onClose} aria-label="Cerrar">✕</button>

      <div className="pdf-wrapper" ref={wrapperRef} {...swipeHandlers}>
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPdfLoading(false); }}
          loading={<div className="pdf-loading"><div className="spinner" /></div>}
          error={<div className="pdf-error">No se pudo cargar el PDF.</div>}
        >
          <div className="pdf-page-container">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={flipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="pdf-page-motion"
              >
                <Page
                  pageNumber={page}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={pdfWidth}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Document>
      </div>

      {!loading && numPages > 1 && (
        <div className="pdf-controls">
          <button
            className="pdf-btn"
            onClick={() => paginate(-1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >←</button>
          <span className="pdf-page">{page} / {numPages}</span>
          <button
            className="pdf-btn"
            onClick={() => paginate(1)}
            disabled={page >= numPages}
            aria-label="Página siguiente"
          >→</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const glowRef   = useRef(null);
  const activeRef = useRef(false);

  const [navStack, setNavStack]         = useState(null);
  const [loading,  setLoading]          = useState(true);
  const [error,    setError]            = useState(null);
  const [resource, setResource]         = useState(null);

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

  // ── Escape to close image overlay ────────────────────────────────────────
  useEffect(() => {
    if (!resource || resource.type !== 'image') return;
    const onKey = (e) => { if (e.key === 'Escape') setResource(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [resource]);

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
              </div>
            ))}
          </nav>
        )}
      </section>

      <footer className="footer-text">ESENCIA PREMIUM</footer>

      {/* Resource overlay */}
      {resource && resource.type === 'pdf' && (
        <PdfViewer url={resource.url} onClose={() => setResource(null)} />
      )}
      {resource && resource.type === 'image' && (
        <div className="resource-overlay" role="dialog" aria-modal="true" aria-label={resource.label}>
          <button className="resource-close" onClick={() => setResource(null)} aria-label="Cerrar">✕</button>
          <img src={resource.url} alt={resource.label} className="resource-img" />
        </div>
      )}
    </main>
  );
}
