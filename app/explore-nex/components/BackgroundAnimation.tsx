import React from "react"
import { motion } from "framer-motion"

const BackgroundAnimation: React.FC = () => {
  // Use fixed values instead of random ones to avoid hydration issues
  const elements = [
    { size: 120, duration: 180, initialX: 10, initialY: 20, x: 30, y: -30 },
    { size: 90, duration: 150, initialX: 30, initialY: 50, x: -20, y: 40 },
    { size: 140, duration: 200, initialX: 60, initialY: 10, x: 20, y: -40 },
    { size: 110, duration: 170, initialX: 90, initialY: 80, x: -30, y: 20 },
    { size: 130, duration: 190, initialX: 20, initialY: 90, x: 40, y: -10 },
    { size: 80, duration: 160, initialX: 50, initialY: 40, x: -40, y: -30 },
    { size: 100, duration: 140, initialX: 80, initialY: 30, x: 10, y: 40 },
    { size: 70, duration: 130, initialX: 40, initialY: 70, x: -10, y: -20 },
    { size: 150, duration: 210, initialX: 70, initialY: 60, x: 30, y: 10 },
    { size: 85, duration: 155, initialX: 25, initialY: 35, x: -30, y: 30 },
    { size: 125, duration: 185, initialX: 75, initialY: 15, x: 20, y: -30 },
    { size: 95, duration: 165, initialX: 45, initialY: 85, x: -20, y: 10 },
    { size: 135, duration: 195, initialX: 15, initialY: 55, x: 40, y: -20 },
    { size: 75, duration: 145, initialX: 55, initialY: 25, x: -40, y: 40 },
    { size: 115, duration: 175, initialX: 85, initialY: 45, x: 10, y: -10 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Floating elements */}
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-blue-600 to-blue-500 opacity-10"
          style={{
            width: el.size,
            height: el.size,
            borderRadius: "40%",
            left: `${el.initialX}%`,
            top: `${el.initialY}%`,
            filter: "blur(40px)",
            backgroundSize: "200% 200%",
          }}
          animate={{
            x: [0, el.x, 0],
            y: [0, el.y, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: el.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundAnimation;
