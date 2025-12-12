import React, { useEffect, useRef, useState } from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ children, delay = 0, className = '', onClick }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    let animationFrameId: number;
    let time = Math.random() * 100;

    const animate = () => {
      time += 0.01;
      // Simple harmonic motion for gentle floating
      const y = Math.sin(time + delay) * 15;
      const x = Math.cos(time * 0.5 + delay) * 10;
      setOffset({ x, y });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [delay]);

  return (
    <div 
      onClick={onClick}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      className={`glass-card p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:scale-105 cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
};

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
};
