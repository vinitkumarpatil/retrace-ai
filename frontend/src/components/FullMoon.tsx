'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface FullMoonProps {
  className?: string;
}

export default function FullMoon({ className = '' }: FullMoonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cursorProximity, setCursorProximity] = useState(0);

  // Mouse parallax motion values (subtle 0.15x movement)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 160, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothX, [-600, 600], [-15, 15]);
  const parallaxY = useTransform(smoothY, [-600, 600], [-10, 10]);

  useEffect(() => {
    const checkMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    checkMotion();

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const moonRadius = rect.width / 2;
        const moonCenterX = rect.left + moonRadius;
        const moonCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - moonCenterX, e.clientY - moonCenterY);

        if (dist < moonRadius * 1.5) {
          const prox = Math.max(0, 1 - dist / (moonRadius * 1.5));
          setCursorProximity(prox);
        } else {
          setCursorProximity(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. TOP-RIGHT SOLAR CORONA FLARE (Golden Atmospheric Halo)    */}
      {/* Matches the brilliant golden sunlight rim in the reference  */}
      {/* ============================================================ */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: isDark ? [0.45, 0.62, 0.45] : [0.25, 0.38, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] rounded-full pointer-events-none blur-3xl -z-10"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(251, 191, 36, 0.55) 0%, rgba(245, 158, 11, 0.3) 35%, rgba(217, 119, 6, 0.12) 60%, rgba(0, 0, 0, 0) 80%)'
            : 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.18) 40%, rgba(255, 255, 255, 0) 75%)',
          filter: `brightness(${1 + cursorProximity * 0.3})`,
        }}
      />

      {/* Cool Cyan Moonlight Ambient Halo (Front / Left Field) */}
      <motion.div
        animate={{
          opacity: isDark ? [0.35, 0.48, 0.35] : [0.2, 0.28, 0.2],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-20 sm:-inset-36 rounded-full blur-3xl -z-20 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.14) 40%, rgba(15, 23, 42, 0) 75%)'
            : 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(125, 211, 252, 0.15) 45%, rgba(248, 250, 252, 0) 80%)',
        }}
      />

      {/* ============================================================ */}
      {/* 2. THE PLANETARY MOON SPHERE (SVG with Realistic Shading)    */}
      {/* Dimensions scaled to frame the hero: w-[620px] to 1050px+   */}
      {/* ============================================================ */}
      <motion.div
        style={{
          x: prefersReducedMotion ? 0 : parallaxX,
          y: prefersReducedMotion ? 0 : parallaxY,
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                y: [-6, 6, -6],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-[520px] h-[520px] sm:w-[720px] sm:h-[720px] md:w-[880px] md:h-[880px] lg:w-[1040px] lg:h-[1040px]"
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full drop-shadow-[0_0_85px_rgba(56,189,248,0.22)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Base Spherical Shading Gradient: Golden Sun-Rim (top right) to Deep Cyan/Blue (left) */}
            <radialGradient
              id="moonSunlightSphere"
              cx="75%"
              cy="25%"
              r="75%"
              fx="78%"
              fy="22%"
            >
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
              <stop offset="8%" stopColor="#FEF3C7" stopOpacity="0.98" />
              <stop offset="22%" stopColor="#FDE68A" stopOpacity="0.92" />
              <stop offset="42%" stopColor="#CBD5E1" stopOpacity="0.85" />
              <stop offset="68%" stopColor="#475569" stopOpacity="0.82" />
              <stop offset="85%" stopColor="#1E293B" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="1" />
            </radialGradient>

            {/* Cool Cyan Moonlight Wash for Front/Left Face */}
            <linearGradient id="cyanMoonlightWash" x1="0%" y1="60%" x2="80%" y2="20%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={isDark ? "0.38" : "0.2"} />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>

            {/* Radiant Golden Crescent Flare (Top-Right Rim Light) */}
            <linearGradient id="goldenRimFlare" x1="100%" y1="0%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
              <stop offset="15%" stopColor="#FDE68A" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#D97706" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </linearGradient>

            {/* Dark Limb Edge Vignette (3D Spherical Falloff) */}
            <radialGradient id="limbedgeShadow" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="#000000" stopOpacity="0" />
              <stop offset="95%" stopColor="#050B17" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>

            {/* Maria Basalt Texture Fill */}
            <radialGradient id="mariaBasalt1" cx="38%" cy="42%" r="28%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#334155" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mariaBasalt2" cx="56%" cy="52%" r="24%">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.88" />
              <stop offset="70%" stopColor="#1E293B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mariaBasalt3" cx="30%" cy="66%" r="26%">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.82" />
              <stop offset="65%" stopColor="#1E293B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0" />
            </radialGradient>

            {/* Crater 3D Shadow/Highlight Filters */}
            <linearGradient id="craterLight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#CBD5E1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#090E1A" stopOpacity="0.9" />
            </linearGradient>

            {/* Lunar Clip Circle */}
            <clipPath id="lunarSphereClip">
              <circle cx="500" cy="500" r="480" />
            </clipPath>
          </defs>

          {/* ============================================================ */}
          {/* LUNAR SPHERE BODY (Clipped to Circle)                        */}
          {/* ============================================================ */}
          <g clipPath="url(#lunarSphereClip)">
            {/* 1. Base Multi-Tone Sphere */}
            <circle cx="500" cy="500" r="480" fill="url(#moonSunlightSphere)" />

            {/* 2. Cool Cyan Moonlight Wash on Left Face */}
            <circle cx="500" cy="500" r="480" fill="url(#cyanMoonlightWash)" />

            {/* 3. Major Lunar Maria (Dark Basalt Plains matching real Moon) */}
            {/* Oceanus Procellarum (Left Side) */}
            <path
              d="M 220 320 Q 320 280 390 380 Q 430 490 340 580 Q 250 630 180 520 Q 140 410 220 320 Z"
              fill="url(#mariaBasalt1)"
            />

            {/* Mare Imbrium (Upper Center) */}
            <path
              d="M 380 230 Q 520 210 570 310 Q 550 420 440 430 Q 330 400 380 230 Z"
              fill="url(#mariaBasalt2)"
            />

            {/* Mare Serenitatis & Tranquillitatis (Center to Right) */}
            <path
              d="M 520 340 Q 640 320 680 410 Q 670 510 580 530 Q 490 500 520 340 Z"
              fill="url(#mariaBasalt2)"
            />
            <path
              d="M 560 480 Q 690 460 720 560 Q 680 660 570 650 Q 500 590 560 480 Z"
              fill="url(#mariaBasalt1)"
            />

            {/* Mare Nubium & Humorum (Lower Left) */}
            <path
              d="M 280 570 Q 400 560 420 680 Q 370 790 270 780 Q 210 710 280 570 Z"
              fill="url(#mariaBasalt3)"
            />

            {/* 4. Tycho Crater Radiant Ray System (Southern Highlands) */}
            <g opacity="0.35">
              <circle cx="480" cy="810" r="16" fill="#FFFFFF" />
              {/* Radiating White Ejecta Rays across the Moon */}
              <line x1="480" y1="810" x2="310" y2="480" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.4" />
              <line x1="480" y1="810" x2="220" y2="600" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.35" />
              <line x1="480" y1="810" x2="680" y2="520" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.4" />
              <line x1="480" y1="810" x2="590" y2="350" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.35" />
              <line x1="480" y1="810" x2="400" y2="280" stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.3" />
              <line x1="480" y1="810" x2="780" y2="680" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.3" />
            </g>

            {/* 5. Copernicus & Kepler Ray System (Central Highlands) */}
            <g opacity="0.4">
              <circle cx="370" cy="450" r="14" fill="#FFFFFF" />
              <circle cx="370" cy="450" r="8" fill="#1E293B" />
              <line x1="370" y1="450" x2="240" y2="360" stroke="#E2E8F0" strokeWidth="2" strokeOpacity="0.4" />
              <line x1="370" y1="450" x2="480" y2="380" stroke="#E2E8F0" strokeWidth="2" strokeOpacity="0.4" />
              <line x1="370" y1="450" x2="330" y2="580" stroke="#E2E8F0" strokeWidth="2" strokeOpacity="0.4" />
              <line x1="370" y1="450" x2="200" y2="480" stroke="#E2E8F0" strokeWidth="1.8" strokeOpacity="0.3" />
            </g>

            {/* 6. Prominent Surface Craters with 3D Depth */}
            {/* Crater Plato (Dark Floored Ring Crater) */}
            <ellipse cx="440" cy="220" rx="24" ry="16" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" strokeOpacity="0.7" />
            
            {/* Aristarchus (Brightest Crater on Moon) */}
            <circle cx="260" cy="380" r="12" fill="#FFFFFF" filter="drop-shadow(0 0 8px #FFFBEB)" />
            <circle cx="260" cy="380" r="6" fill="#CBD5E1" />

            {/* Clavius (Huge South Polar Crater with Interior Crater Chain) */}
            <ellipse cx="450" cy="870" rx="42" ry="26" fill="#0F172A" stroke="#94A3B8" strokeWidth="2.5" strokeOpacity="0.6" />
            <circle cx="430" cy="866" r="6" fill="#334155" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="445" cy="872" r="5" fill="#334155" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="460" cy="876" r="4" fill="#334155" stroke="#CBD5E1" strokeWidth="1" />

            {/* Additional realistic scattered crater rings */}
            <circle cx="310" cy="270" r="16" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="2" />
            <circle cx="620" cy="300" r="22" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="2.5" />
            <circle cx="720" cy="420" r="18" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="2" />
            <circle cx="580" cy="620" r="28" fill="#0F172A" stroke="url(#craterLight)" strokeWidth="3" />
            <circle cx="210" cy="630" r="20" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="2" />
            <circle cx="670" cy="710" r="24" fill="#0F172A" stroke="url(#craterLight)" strokeWidth="2.5" />
            <circle cx="340" cy="740" r="18" fill="#0F172A" stroke="url(#craterLight)" strokeWidth="2" />
            <circle cx="520" cy="740" r="22" fill="#0F172A" stroke="url(#craterLight)" strokeWidth="2.5" />
            <circle cx="750" cy="540" r="15" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="1.8" />
            <circle cx="260" cy="520" r="14" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="1.8" />
            <circle cx="470" cy="330" r="11" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="1.5" />
            <circle cx="550" cy="420" r="13" fill="#1E293B" stroke="url(#craterLight)" strokeWidth="1.5" />

            {/* 7. Limb Shadow Overlay (Spherical Edge Falloff) */}
            <circle cx="500" cy="500" r="480" fill="url(#limbedgeShadow)" />

            {/* 8. Top-Right Golden Sunlight Flare Overlay (Solar Rim Peak) */}
            <path
              d="M 500 20 A 480 480 0 0 1 980 500 L 780 420 A 400 400 0 0 0 420 180 Z"
              fill="url(#goldenRimFlare)"
              opacity="0.95"
            />
          </g>

          {/* Glowing Lunar Perimeter Ring (Atmospheric Rim Halo) */}
          <circle
            cx="500"
            cy="500"
            r="480"
            fill="none"
            stroke="url(#goldenRimFlare)"
            strokeWidth="5"
            strokeOpacity="0.8"
            className="filter drop-shadow-[0_0_24px_rgba(251,191,36,0.65)]"
          />

          {/* Upper Right Sun-Crest Intense Starburst Highlight */}
          <g filter="drop-shadow(0 0 35px #FDE68A)" opacity="0.9">
            <ellipse cx="840" cy="180" rx="35" ry="18" transform="rotate(-35 840 180)" fill="#FFFBEB" />
            <circle cx="840" cy="180" r="10" fill="#FFFFFF" />
          </g>
        </svg>

        {/* ============================================================ */}
        {/* 3. VOLUMETRIC BOTTOM CELESTIAL CLOUDS (Wrapping Moon Base)   */}
        {/* Matches the glowing clouds in the reference mockup           */}
        {/* ============================================================ */}
        <div className="absolute -bottom-16 sm:-bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-48 sm:h-64 pointer-events-none -z-5 overflow-hidden">
          <div
            className="w-full h-full opacity-75"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.75) 45%, rgba(245, 158, 11, 0.25) 70%, rgba(0, 0, 0, 0) 90%)'
                : 'radial-gradient(ellipse at 50% 100%, rgba(241, 245, 249, 0.95) 0%, rgba(224, 231, 255, 0.65) 50%, rgba(251, 191, 36, 0.15) 75%, rgba(255, 255, 255, 0) 95%)',
              filter: 'blur(32px)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
