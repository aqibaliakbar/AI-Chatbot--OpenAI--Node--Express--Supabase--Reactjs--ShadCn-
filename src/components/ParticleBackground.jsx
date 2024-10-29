// src/components/ParticleBackground/ParticleBackground.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ParticleBackground = ({
  count = 50,
  minSize = 1,
  maxSize = 4,
  minOpacity = 0.2,
  maxOpacity = 0.7,
  speed = 0.5,
  className = "",
}) => {
  const [particles, setParticles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
      opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.4 + 0.8,
    }))
  );

  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        setParticles((particles) =>
          particles.map((particle) => ({
            ...particle,
            x: (particle.x + particle.speedX + 100) % 100,
            y: (particle.y + particle.speedY + 100) % 100,
            rotation: (particle.rotation + 0.1) % 360,
          }))
        );
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          animate={{
            scale: [particle.scale, particle.scale * 1.2, particle.scale],
            opacity: [
              particle.opacity,
              particle.opacity * 1.2,
              particle.opacity,
            ],
            rotate: [particle.rotation, particle.rotation + 180],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
