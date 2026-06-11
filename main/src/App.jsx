import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const glowRef = useRef(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const glow = glowRef.current;

    const handleMouseMove = (e) => {
      if (!activeRef.current) {
        glow.style.opacity = '1';
        activeRef.current = true;
      }
      requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    };

    const handleMouseLeave = () => {
      glow.style.opacity = '0';
      activeRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleMenuClick = (e) => {
    const item = e.currentTarget;
    item.style.transform = 'translateY(2px) translateZ(10px) scale(0.98)';
    setTimeout(() => {
      item.style.transform = '';
      const text = item.innerText.trim().toUpperCase();
      if (text === 'CARTA HECHIZO HKL') {
        window.open('/assets/CARTA HECHIZO 1.pdf', '_blank');
      } else {
        console.log('Clicked:', text);
      }
    }, 200);
  };

  return (
    <main className="scene">
      <div className="noise" aria-hidden="true" />
      <div className="velvet" aria-hidden="true" />
      <div className="spotlight" aria-hidden="true" />
      <div className="glow-point" ref={glowRef} aria-hidden="true" />

      <div className="smoke-container" aria-hidden="true">
        <div className="smoke-puff" />
        <div className="smoke-puff" />
        <div className="smoke-puff" />
      </div>
      fff

      <div className="leaves" aria-hidden="true">
        <div className="leaf leaf-1" />
        <div className="leaf leaf-2" />
      </div>

      <section className="content" aria-labelledby="main-heading">
        <header className="brand">
          <h1 className="title" id="main-heading">HECHIZO</h1>
          <div className="subtitle">Hookah Lounge</div>
        </header>

        <div className="divider" aria-hidden="true" />

        <nav className="menu" aria-label="Menú Principal">
          <div className="menu-item" role="button" tabIndex={0} onClick={handleMenuClick}>
            <span>Carta Hechizo HKL</span>
          </div>
          <div className="menu-item" role="button" tabIndex={0} onClick={handleMenuClick}>
            <span>Carta Burger</span>
          </div>
          <div className="menu-item" role="button" tabIndex={0} onClick={handleMenuClick}>
            <span>Carta Sushi</span>
          </div>
        </nav>
      </section>

      <footer className="footer-text">ESENCIA PREMIUM</footer>
    </main>
  );
}

export default App;
