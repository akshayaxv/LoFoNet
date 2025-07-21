import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

interface EmojiParticlesProps {
  emojis?: string[];
}

const EmojiParticles: React.FC<EmojiParticlesProps> = ({ 
  emojis = ['📱', '👜', '🗝️', '📝', '💳', '🎧', '⌚', '📖'] 
}) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="emoji-particles"
      init={particlesInit}
      options={{
        background: {
          opacity: 0,
        },
        fpsLimit: 60,
        particles: {
          number: {
            value: 15,
            density: {
              enable: true,
              area: 800,
            },
          },
          shape: {
            type: "character",
            character: emojis.map(emoji => ({
              value: emoji,
              font: "Arial",
              weight: "400",
            })),
          },
          opacity: {
            value: 0.6,
            random: {
              enable: true,
              minimumValue: 0.3,
            },
          },
          size: {
            value: 20,
            random: {
              enable: true,
              minimumValue: 15,
            },
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default EmojiParticles;