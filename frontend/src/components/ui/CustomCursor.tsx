import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({
        x: 0,
        y: 0
    });
    
    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    const trailCount = 8;
    const trailColors = [
        'var(--color-primary)', // most visible
        'var(--color-primary-container)',
        'var(--color-primary-light)',
        'var(--color-accent)',
        'var(--color-accent-light)',
        'rgba(255,255,255,0.4)',
        'rgba(255,255,255,0.2)',
        'rgba(255,255,255,0.1)'
    ];

    return (
        <div style={{ pointerEvents: 'none', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
            {Array.from({ length: trailCount }).map((_, index) => {
                // Her bir kuyruk nesnesi mousedan biraz daha geç gelir
                return (
                    <motion.div
                        key={index}
                        animate={{
                            x: mousePosition.x,
                            y: mousePosition.y
                        }}
                        transition={{
                            type: "spring",
                            mass: 0.05,
                            stiffness: 1000 - (index * 110), // arkadakiler daha geç gelir
                            damping: 30 + (index * 5)
                        }}
                        style={{
                            position: 'absolute',
                            left: -6,
                            top: -6,
                            width: `${12 - index}px`,
                            height: `${12 - index}px`,
                            borderRadius: '50%',
                            backgroundColor: trailColors[index] || 'var(--color-primary)',
                            opacity: 1 - (index * 0.1),
                            boxShadow: `0 0 ${4 + index}px ${trailColors[index] || 'rgba(0,0,0,0)'}`
                        }}
                    />
                );
            })}
        </div>
    );
};
