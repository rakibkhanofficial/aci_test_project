'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export function SpaceBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [comet, setComet] = useState<{ x: number; y: number; visible: boolean }>({ 
    x: -100, 
    y: 0, 
    visible: false 
  });

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(newStars);

    // Animate stars
    const interval = setInterval(() => {
      setStars(prev => prev.map(star => ({
        ...star,
        x: (star.x - star.speed * 0.01) % 100,
        opacity: star.opacity + (Math.random() - 0.5) * 0.1,
      })));
    }, 50);

    // Random comet appearance
    const cometInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setComet({
          x: -100,
          y: Math.random() * 100,
          visible: true
        });

        setTimeout(() => {
          setComet(prev => ({ ...prev, visible: false }));
        }, 3000);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(cometInterval);
    };
  }, []);

useEffect(() => {
  let cometAnimation: NodeJS.Timeout;
  
  if (comet.visible) {
    cometAnimation = setInterval(() => {
      setComet(prev => ({
        ...prev,
        x: prev.x + 2,
      }));
    }, 16);
  }
  
  // Always return cleanup function
  return () => {
    if (cometAnimation) clearInterval(cometAnimation);
  };
}, [comet.visible]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-space-950/90 to-gray-950" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}vw`,
            top: `${star.y}vh`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(255, 255, 255, 0.3)`,
          }}
        />
      ))}
      
      {/* Nebula effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nebula-purple rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-nebula-blue rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-nebula-pink rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Comet */}
      {comet.visible && (
        <div
          className="absolute w-1 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-full"
          style={{
            left: `${comet.x}vw`,
            top: `${comet.y}vh`,
            boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.5)',
          }}
        >
          <div className="absolute -top-1 -left-24 w-24 h-3 bg-gradient-to-r from-transparent via-blue-400/50 to-blue-300 blur-sm" />
        </div>
      )}
      
      {/* Pulsing orb */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>
    </div>
  );
}