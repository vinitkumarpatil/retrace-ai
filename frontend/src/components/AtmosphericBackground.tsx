'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface AtmosphericBackgroundProps {
  isInvestigating?: boolean;
}

export default function AtmosphericBackground({
  isInvestigating = false,
}: AtmosphericBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth Spring Physics for Natural Cinematic Inertia
  const springConfig = { damping: 45, stiffness: 95, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Scroll Parallax (Moon moves slower than the page scroll)
  const { scrollY } = useScroll();

  // Mouse Parallax Transforms (Strictly following requested multiplier specs):
  // Background: 0.1x movement
  const bgMouseX = useTransform(smoothMouseX, [-800, 800], isMobile ? [0, 0] : [-12, 12]);
  const bgMouseY = useTransform(smoothMouseY, [-600, 600], isMobile ? [0, 0] : [-8, 8]);

  // Moon: 0.15x movement
  const moonMouseX = useTransform(smoothMouseX, [-800, 800], isMobile ? [0, 0] : [-18, 18]);
  const moonMouseY = useTransform(smoothMouseY, [-600, 600], isMobile ? [0, 0] : [-14, 14]);

  // Atmosphere: 0.2x movement
  const atmoMouseX = useTransform(smoothMouseX, [-800, 800], isMobile ? [0, 0] : [-24, 24]);
  const atmoMouseY = useTransform(smoothMouseY, [-600, 600], isMobile ? [0, 0] : [-18, 18]);

  // Foreground Overlay / Spotlight: 0.25x movement
  const fgMouseX = useTransform(smoothMouseX, [-800, 800], isMobile ? [0, 0] : [-30, 30]);
  const fgMouseY = useTransform(smoothMouseY, [-600, 600], isMobile ? [0, 0] : [-22, 22]);

  // Scroll Parallax Transforms (subtle GPU translate3d offsets):
  // Moon moves slightly slower than the page (stays majestically visible longer)
  const moonScrollParallax = useTransform(scrollY, [0, 1200], [0, 160]);
  const starsScrollParallax = useTransform(scrollY, [0, 1200], [0, 220]);
  const cloudsScrollParallax = useTransform(scrollY, [0, 1200], [0, 110]);

  // Mouse coordinate tracker for cursor moonlight spotlight
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ willChange: 'transform, opacity' }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* LAYER 1: DARK SPACE BACKGROUND (Deep Navy Cosmic Canvas)      */}
      {/* Parallax factor: 0.1x                                        */}
      {/* ============================================================ */}
      <motion.div
        style={{
          x: prefersReducedMotion ? 0 : bgMouseX,
          y: prefersReducedMotion ? 0 : bgMouseY,
        }}
        className="absolute inset-0 w-full h-full transition-colors duration-700"
      >
        {/* Dark Mode Cosmic Gradient */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 85% 15%, #0B162C 0%, #070B14 55%, #04070D 100%)',
          }}
        />

        {/* Light Mode Soft Silver/Blue Atmosphere */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 85% 15%, #E2E8F0 0%, #F1F5F9 45%, #F8FAFC 100%)',
          }}
        />
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 3: SOFT MOON GLOW (Lightweight CSS radial-gradient)    */}
      {/* Positioned behind the Moon, slowly changes size & opacity    */}
      {/* Parallax factor: 0.2x                                        */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : cloudsScrollParallax,
        }}
        className="absolute top-[-10%] sm:top-[-16%] right-[-12%] sm:right-[-4%] lg:right-[0%] w-[580px] h-[580px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] pointer-events-none"
      >
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : atmoMouseX,
            y: prefersReducedMotion ? 0 : atmoMouseY,
          }}
          className="w-full h-full"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.06, 1],
                    opacity: isDark
                      ? isInvestigating
                        ? [0.55, 0.75, 0.55]
                        : [0.38, 0.58, 0.38]
                      : [0.2, 0.35, 0.2],
                  }
            }
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(245, 158, 11, 0.14) 38%, rgba(14, 165, 233, 0.05) 58%, transparent 72%)'
                : 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(251, 191, 36, 0.12) 40%, rgba(224, 231, 255, 0.05) 60%, transparent 75%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 2: CINEMATIC MOON IMAGE (Large Detailed Moon Asset)    */}
      {/* Occupies right side of hero, extends beyond viewport edge    */}
      {/* Subtly floats 20-40s with translate3d + scale                */}
      {/* Parallax factor: 0.15x mouse + scroll parallax               */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : moonScrollParallax,
        }}
        className="absolute top-[-4%] sm:top-[-8%] md:top-[-12%] lg:top-[-14%] right-[-15%] sm:right-[-6%] md:right-[-2%] lg:right-[0%] w-[580px] h-[580px] sm:w-[840px] sm:h-[840px] md:w-[1040px] md:h-[1040px] lg:w-[1280px] lg:h-[1280px] xl:w-[1440px] xl:h-[1440px] pointer-events-none"
      >
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : moonMouseX,
            y: prefersReducedMotion ? 0 : moonMouseY,
          }}
          className="w-full h-full"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [-7, 7, -7],
                    scale: [1, 1.015, 1],
                  }
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-full h-full pointer-events-none"
            style={{ willChange: 'transform' }}
          >
            {/* Dark Mode Moon Image Asset */}
            <motion.img
              src="/images/cinematic-space-bg.webp"
              alt="Cinematic Moon Background"
              loading="eager"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-contain object-right-top pointer-events-none transition-opacity duration-700 ${
                isDark ? 'opacity-95' : 'opacity-0'
              }`}
              style={{
                filter: 'drop-shadow(0 0 65px rgba(56, 189, 248, 0.18))',
              }}
            />

            {/* Light Mode Moon Image Asset (Reduced intensity, soft blue/silver atmosphere) */}
            <motion.img
              src="/images/cinematic-space-light.webp"
              alt="Cinematic Moon Background (Light Mode)"
              loading="eager"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-contain object-right-top pointer-events-none transition-opacity duration-700 ${
                isDark ? 'opacity-0' : 'opacity-80'
              }`}
              style={{
                filter: 'drop-shadow(0 0 45px rgba(186, 230, 253, 0.25))',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 4: SMALL NUMBER OF STARS (Lightweight SVG Layer)       */}
      {/* ~45 stars total; only ~8 stars slowly twinkle. 60 FPS.       */}
      {/* Parallax factor: 0.12x mouse + scroll parallax               */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : starsScrollParallax,
        }}
        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700"
      >
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : bgMouseX,
            y: prefersReducedMotion ? 0 : bgMouseY,
          }}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            className={`w-full h-full pointer-events-none transition-opacity duration-700 ${
              isDark ? 'opacity-85' : 'opacity-35'
            }`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Static Background Stars (Far cosmic field) */}
            <g fill={isDark ? '#E2E8F0' : '#64748B'} opacity={isDark ? '0.45' : '0.3'}>
              <circle cx="80" cy="120" r="1.1" />
              <circle cx="160" cy="240" r="0.9" />
              <circle cx="240" cy="90" r="1.2" />
              <circle cx="320" cy="310" r="0.8" />
              <circle cx="410" cy="160" r="1.0" />
              <circle cx="490" cy="280" r="0.9" />
              <circle cx="560" cy="110" r="1.2" />
              <circle cx="650" cy="220" r="0.8" />
              <circle cx="120" cy="460" r="1.0" />
              <circle cx="210" cy="580" r="0.8" />
              <circle cx="290" cy="420" r="1.1" />
              <circle cx="380" cy="540" r="0.9" />
              <circle cx="460" cy="480" r="1.0" />
              <circle cx="540" cy="620" r="0.8" />
              <circle cx="680" cy="510" r="1.1" />
              <circle cx="110" cy="740" r="0.9" />
              <circle cx="250" cy="810" r="1.0" />
              <circle cx="360" cy="720" r="0.8" />
              <circle cx="480" cy="790" r="1.1" />
              <circle cx="590" cy="840" r="0.9" />
              <circle cx="720" cy="760" r="1.0" />
              <circle cx="820" cy="180" r="0.8" />
              <circle cx="890" cy="95" r="1.0" />
              <circle cx="980" cy="140" r="0.9" />
              <circle cx="1320" cy="80" r="1.1" />
              <circle cx="1380" cy="190" r="0.8" />
            </g>

            {/* Cyan/Blue Tinted Mid-field Stars */}
            <g fill="#38BDF8" opacity={isDark ? '0.6' : '0.4'}>
              <circle cx="190" cy="170" r="1.4" />
              <circle cx="350" cy="130" r="1.3" />
              <circle cx="520" cy="200" r="1.5" />
              <circle cx="150" cy="630" r="1.2" />
              <circle cx="420" cy="660" r="1.4" />
              <circle cx="620" cy="380" r="1.3" />
              <circle cx="780" cy="120" r="1.5" />
            </g>

            {/* Golden Warm Stars (Near Solar Flare Corner) */}
            <g fill="#FDE68A" opacity={isDark ? '0.7' : '0.45'}>
              <circle cx="1180" cy="110" r="1.4" />
              <circle cx="1260" cy="65" r="1.6" />
              <circle cx="1340" cy="140" r="1.3" />
            </g>

            {/* Slowly Twinkling Stars (Only 8 stars with GPU opacity animation) */}
            {!prefersReducedMotion && (
              <g>
                <circle
                  cx="190"
                  cy="170"
                  r="1.6"
                  fill="#38BDF8"
                  className="animate-twinkle-slow"
                />
                <circle
                  cx="350"
                  cy="130"
                  r="1.5"
                  fill="#FFFFFF"
                  className="animate-twinkle-mid"
                />
                <circle
                  cx="520"
                  cy="200"
                  r="1.8"
                  fill="#38BDF8"
                  className="animate-twinkle-fast"
                />
                <circle
                  cx="240"
                  cy="90"
                  r="1.5"
                  fill="#FFFFFF"
                  className="animate-twinkle-slow"
                />
                <circle
                  cx="680"
                  cy="510"
                  r="1.4"
                  fill="#38BDF8"
                  className="animate-twinkle-mid"
                />
                <circle
                  cx="420"
                  cy="660"
                  r="1.6"
                  fill="#FFFFFF"
                  className="animate-twinkle-slow"
                />
                <circle
                  cx="1260"
                  cy="65"
                  r="2.0"
                  fill="#FDE68A"
                  className="animate-twinkle-mid"
                />
                <circle
                  cx="1340"
                  cy="140"
                  r="1.7"
                  fill="#FDE68A"
                  className="animate-twinkle-slow"
                />
              </g>
            )}
          </svg>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 5: VERY SUBTLE ATMOSPHERIC CLOUDS                      */}
      {/* Soft drifting clouds along the bottom horizon of the hero    */}
      {/* Parallax factor: 0.2x                                        */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : cloudsScrollParallax,
        }}
        className="absolute top-[40%] sm:top-[35%] lg:top-[30%] right-[-10%] sm:right-[-4%] w-[650px] sm:w-[950px] lg:w-[1300px] h-72 sm:h-96 pointer-events-none overflow-hidden"
      >
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : atmoMouseX,
            y: prefersReducedMotion ? 0 : atmoMouseY,
          }}
          className="w-full h-full"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    x: [-12, 12, -12],
                    opacity: isDark ? [0.45, 0.65, 0.45] : [0.2, 0.35, 0.2],
                  }
            }
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at 60% 70%, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.4) 40%, rgba(245, 158, 11, 0.08) 60%, transparent 80%)'
                : 'radial-gradient(ellipse at 60% 70%, rgba(224, 231, 255, 0.5) 0%, rgba(241, 245, 249, 0.35) 45%, transparent 75%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* LAYER 6: DARK OVERLAY BEHIND TEXT FOR READABILITY            */}
      {/* Directional scrims protecting text contrast on the left side */}
      {/* ============================================================ */}
      {/* Left-to-Right Hero Text Scrim */}
      <div
        className={`absolute inset-y-0 left-0 w-full lg:w-3/5 pointer-events-none transition-opacity duration-700 ${
          isDark ? 'opacity-95' : 'opacity-90'
        }`}
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(7, 11, 20, 0.96) 0%, rgba(7, 11, 20, 0.85) 45%, rgba(7, 11, 20, 0.4) 75%, transparent 100%)'
            : 'linear-gradient(90deg, rgba(248, 250, 252, 0.98) 0%, rgba(248, 250, 252, 0.88) 45%, rgba(248, 250, 252, 0.4) 75%, transparent 100%)',
        }}
      />

      {/* Bottom Hero Fade into Content Sections */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none transition-colors duration-700"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(7, 11, 20, 0.7) 60%, rgba(7, 11, 20, 1) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.7) 60%, rgba(248, 250, 252, 1) 100%)',
        }}
      />

      {/* Cursor Moonlight Spotlight (Subtle interactive light behind cursor) */}
      {!isMobile && (
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : fgMouseX,
            y: prefersReducedMotion ? 0 : fgMouseY,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
            style={{
              left: `${cursorPos.x - 160}px`,
              top: `${cursorPos.y - 160}px`,
              opacity: isDark ? 0.12 : 0.08,
              background: isDark
                ? 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0) 70%)'
                : 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 70%)',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
