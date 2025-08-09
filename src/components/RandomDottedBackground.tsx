import React from 'react';

interface RandomDottedBackgroundProps {
  width?: string;
  height?: string;
  dotColor?: string;
  dotSize?: number;
  dotDensity?: number;
  opacity?: number;
  className?: string;
}

const RandomDottedBackground: React.FC<RandomDottedBackgroundProps> = ({
  width = '100%',
  height = '100%',
  dotColor = '#000',
  dotSize = 2,
  dotDensity = 0.003,
  opacity = 0.2,
  className = '',
}) => {
  const generateDots = () => {
    const dots = [];
    const dotCount = Math.floor(window.innerWidth * window.innerHeight * dotDensity);

    for (let i = 0; i < dotCount; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = dotSize * (0.5 + Math.random());
      const delay = Math.random() * 2;
      
      dots.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: dotColor,
            borderRadius: '50%',
            opacity: opacity,
            animation: `pulse 3s ease-in-out ${delay}s infinite`,
          }}
        />
      );
    }
    return dots;
  };

  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: ${opacity}; }
          50% { transform: scale(1.5); opacity: ${opacity * 0.5}; }
        }
      `}</style>
      {typeof window !== 'undefined' && generateDots()}
    </div>
  );
};

export default RandomDottedBackground;
