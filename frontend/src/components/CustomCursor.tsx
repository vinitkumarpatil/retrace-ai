'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

export default function CustomCursor() {
  const { cursorText, cursorVariant } = useCursor();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer ring
  const springConfig = { damping: 30, stiffness: 350, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad) and is not touch-only or reduced-motion
    const checkCapabilities = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !hasFinePointer;
      const isSmallScreen = window.innerWidth < 768;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEnabled((hasFinePointer || !isTouchOnly) && !isSmallScreen && !prefersReducedMotion);
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isHovered) setIsHovered(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);
    };

    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', checkCapabilities);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isHovered]);

  if (!isEnabled || !isHovered) {
    return null;
  }

  const hasText = cursorText.length > 0;
  const isInteractive = cursorVariant !== 'default' || hasText;

  // Size calculation: subtle, not giant
  let ringSize = 28;
  if (hasText) {
    ringSize = 58;
  } else if (isInteractive) {
    ringSize = 38;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* 1. Subtle Click Ripple */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0.2, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-8 h-8 rounded-full border border-sky-400 pointer-events-none"
        />
      ))}

      {/* 2. Precise Center Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.6 : hasText ? 0 : 1,
          opacity: hasText ? 0 : 0.9,
        }}
        transition={{ duration: 0.12 }}
        className="w-1.5 h-1.5 rounded-full bg-sky-400 pointer-events-none"
      />

      {/* 3. Spring-Delayed Outer Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          scale: isClicked ? 0.92 : 1,
          borderColor: hasText
            ? 'rgba(56, 189, 248, 0.75)'
            : isInteractive
            ? 'rgba(56, 189, 248, 0.45)'
            : 'rgba(148, 163, 184, 0.25)',
          backgroundColor: hasText
            ? 'rgba(7, 11, 20, 0.88)'
            : 'rgba(56, 189, 248, 0.02)',
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="rounded-full border backdrop-blur-[1px] flex items-center justify-center pointer-events-none transition-colors"
      >
        <AnimatePresence mode="wait">
          {hasText && (
            <motion.span
              key={cursorText}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.12 }}
              className="text-[9px] font-mono font-bold tracking-wider text-sky-300 select-none text-center px-1 uppercase"
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
