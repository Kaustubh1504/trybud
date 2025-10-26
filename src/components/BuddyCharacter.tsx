import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import your character stages (7 total stages!)
import buddyStage0 from '/characters/char1.png'; // Crying with tear
import buddyStage1 from '/characters/char2.png'; // Naked
import buddyStage2 from '/characters/char3.png'; // Shirt only
import buddyStage3 from '/characters/char4.png'; // Shirt + Shoes
import buddyStage4 from '/characters/char5.png'; // Business Casual
import buddyStage5 from '/characters/char6.png'; // Business Professional
import buddyStage6 from '/characters/char1.png'; // Executive (Red tie)

interface BuddyCharacterProps {
    points: number;
    size?: 'small' | 'medium' | 'large';
    showLevelBadge?: boolean;
    animated?: boolean;
}

const BuddyCharacter: React.FC<BuddyCharacterProps> = ({
    points,
    size = 'medium',
    showLevelBadge = true,
    animated = true
}) => {
    const [currentStage, setCurrentStage] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number }>>([]);

    // Calculate stage based on points
    const getStage = (pts: number) => {
        if (pts < 500) return 0;
        if (pts < 1000) return 1;
        if (pts < 2000) return 2;
        if (pts < 3500) return 3;
        if (pts < 5000) return 4;
        return 5;
    };

    // Get character image based on stage
    const getBuddyImage = (stage: number) => {
        const images = [buddyStage0, buddyStage1, buddyStage2, buddyStage3, buddyStage4, buddyStage5];
        return images[stage] || images[0];
    };

    // Get stage name
    const getStageName = (stage: number) => {
        const names = [
            'Job Seeker',
            'Getting Started',
            'Rising Star',
            'Professional',
            'Executive',
            'Wealthy Entrepreneur'
        ];
        return names[stage];
    };

    // Size configurations
    const sizeConfig = {
        small: { width: 150, height: 150 },
        medium: { width: 250, height: 250 },
        large: { width: 400, height: 400 }
    };

    // Check for stage changes
    useEffect(() => {
        const newStage = getStage(points);
        if (newStage > currentStage) {
            setShowLevelUp(true);
            createLevelUpParticles();
            setTimeout(() => setShowLevelUp(false), 3000);
        }
        setCurrentStage(newStage);
    }, [points]);

    // Create celebration particles
    const createLevelUpParticles = () => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Level Up Celebration */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #FF006E, #BB00FF)',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            zIndex: 100,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 0 40px rgba(255, 0, 110, 0.8)'
                        }}
                    >
                        🎉 LEVEL UP! 🎉
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Particles */}
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1
                    }}
                    animate={{
                        x: particle.x * 3,
                        y: particle.y * 3,
                        opacity: 0,
                        scale: 0
                    }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: `hsl(${Math.random() * 360}, 100%, 60%)`,
                        pointerEvents: 'none',
                        zIndex: 50
                    }}
                />
            ))}

            {/* Level Badge */}
            {showLevelBadge && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        color: '#1A2332',
                        fontSize: size === 'large' ? '1.2rem' : '1rem',
                        zIndex: 10,
                        boxShadow: '0 5px 25px rgba(255, 215, 0, 0.6)',
                        border: '3px solid #FFD700'
                    }}
                >
                    {getStageName(currentStage)}
                </motion.div>
            )}

            {/* Character Container with Glow */}
            <motion.div
                animate={animated ? {
                    y: [0, -15, 0],
                    rotate: [-2, 2, -2]
                } : {}}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'relative',
                    filter: `drop-shadow(0 0 40px ${currentStage >= 4 ? '#FFD700' : '#00D9FF'})`,
                }}
            >
                {/* Pulsing Glow Ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: sizeConfig[size].width + 40,
                        height: sizeConfig[size].height + 40,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, transparent 60%, ${currentStage >= 4 ? '#FFD700' : '#00D9FF'} 100%)`,
                        zIndex: -1,
                        pointerEvents: 'none'
                    }}
                />

                {/* Character Image */}
                <motion.img
                    key={currentStage} // Re-mount on stage change for animation
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                    src={getBuddyImage(currentStage)}
                    alt={`Buddy Stage ${currentStage}`}
                    style={{
                        width: sizeConfig[size].width,
                        height: sizeConfig[size].height,
                        objectFit: 'contain',
                        filter: currentStage === 0 ? 'grayscale(0.3)' : 'none'
                    }}
                />

                {/* Stage 5 Crown Animation (Wealthy) */}
                {currentStage === 5 && (
                    <motion.div
                        animate={{
                            y: [-5, -10, -5],
                            rotate: [-5, 5, -5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: size === 'large' ? '4rem' : '2rem',
                            zIndex: 20
                        }}
                    >
                        👑
                    </motion.div>
                )}

                {/* Money floating around for Stage 5 */}
                {currentStage === 5 && (
                    <>
                        <motion.div
                            animate={{
                                y: [0, -30, 0],
                                x: [0, 20, 0],
                                rotate: [0, 360, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                position: 'absolute',
                                top: '20%',
                                right: '-10%',
                                fontSize: size === 'large' ? '2.5rem' : '1.5rem',
                                zIndex: 15
                            }}
                        >
                            💰
                        </motion.div>
                        <motion.div
                            animate={{
                                y: [0, -30, 0],
                                x: [0, -20, 0],
                                rotate: [0, -360, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '20%',
                                left: '-10%',
                                fontSize: size === 'large' ? '2.5rem' : '1.5rem',
                                zIndex: 15
                            }}
                        >
                            💎
                        </motion.div>
                    </>
                )}
            </motion.div>

            {/* Points Display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    color: '#00D9FF',
                    fontWeight: 'bold',
                    fontSize: size === 'large' ? '1.5rem' : '1.2rem',
                    textShadow: '0 0 10px rgba(0, 217, 255, 0.8)'
                }}
            >
                {points.toLocaleString()} pts
            </motion.div>
        </div>
    );
};

export default BuddyCharacter;