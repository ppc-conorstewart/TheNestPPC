import { useEffect, useRef, useState } from 'react';

const PALOMA_GREEN = '#6a7257';
const PARTICLE_COUNT = 20;
const LOGO_OPACITY = 0.08;

export default function BackgroundFXOptimized() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse tracking with throttle
    let animationFrameId = null;
    const handleMouseMove = (e) => {
      if (animationFrameId) return;
      animationFrameId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
        animationFrameId = null;
      });
    };

    // Click ripple effect
    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const id = Date.now();
      setRipples(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 2000);
    };

    // Create floating particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      particle.className = `particle particle-${i}`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${20 + Math.random() * 30}s`;
      container.appendChild(particle);
      particles.push(particle);
    }


    // Logo element
    const logoWrapper = document.createElement('div');
    logoWrapper.className = 'logo-wrapper';
    const logo = document.createElement('img');
    logo.src = '/assets/Paloma_Logo_White_Rounded.png';
    logo.className = 'center-logo';
    logoWrapper.appendChild(logo);
    container.appendChild(logoWrapper);

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="bgfx-optimized" style={{ pointerEvents: 'none' }}>
      {/* Dynamic gradient that follows mouse */}
      <div
        className="mouse-gradient"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${PALOMA_GREEN}15 0%, transparent 50%)`
        }}
      />

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`
          }}
        />
      ))}

      <style>{`
        .bgfx-optimized {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        /* Mouse-following gradient */
        .mouse-gradient {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.6;
          mix-blend-mode: screen;
          transition: background 0.3s ease-out;
          pointer-events: none;
        }

        /* Particles with glow */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, ${PALOMA_GREEN} 0%, ${PALOMA_GREEN}80 50%, transparent 100%);
          border-radius: 50%;
          opacity: 0.7;
          box-shadow:
            0 0 20px ${PALOMA_GREEN}60,
            0 0 40px ${PALOMA_GREEN}30,
            0 0 60px ${PALOMA_GREEN}10;
          animation: float linear infinite;
          will-change: transform;
          mix-blend-mode: screen;
        }

        .particle::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: sparkle 2s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.7;
          }
          25% {
            transform: translate(50px, -50px) rotate(90deg) scale(1.2);
            opacity: 0.9;
          }
          50% {
            transform: translate(-30px, -80px) rotate(180deg) scale(0.8);
            opacity: 0.6;
          }
          75% {
            transform: translate(-60px, 30px) rotate(270deg) scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: translate(0, 0) rotate(360deg) scale(1);
            opacity: 0.7;
          }
        }



        /* Logo with subtle pulsing */
        .logo-wrapper {
          position: absolute;
          left: 50%;
          top: 60%;
          transform: translate(-50%, -50%);
          width: min(40vw, 400px);
          height: min(40vw, 400px);
          display: flex;
          align-items: center;
          justify-content: center;
        }


        .center-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: ${LOGO_OPACITY};
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.5));
          position: relative;
          z-index: 1;
        }

        /* Click ripple effect */
        .ripple {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .ripple::before {
          content: '';
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: ${PALOMA_GREEN};
          opacity: 0.5;
          animation: rippleExpand 2s ease-out forwards;
        }

        .ripple::after {
          content: '';
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid ${PALOMA_GREEN};
          opacity: 0.8;
          animation: rippleExpandBorder 2s ease-out forwards;
        }

        @keyframes rippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(10);
            opacity: 0;
          }
        }

        @keyframes rippleExpandBorder {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
          }
        }

        /* Performance optimizations */
        @media (prefers-reduced-motion: reduce) {
          .particle {
            animation: none;
          }
          .mouse-gradient {
            display: none;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .particle {
            animation-duration: 30s;
          }
        }
      `}</style>
    </div>
  );
}