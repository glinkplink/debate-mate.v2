import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

/**
 * Confetti Component
 * Design: Gradient Maximalism with Playful Energy
 * - Celebratory particle effects on debate win
 * - Animated falling confetti with rotation
 * - Multiple colors for visual richness
 */
export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FF8C00', '#FF1493', '#10b981', '#0ea5e9', '#a855f7'];
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: 0.8,
            animation: `confetti-fall ${particle.duration}s linear ${particle.delay}s forwards`,
            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}
