'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Play,
  Sun,
  Moon,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  onLoadDemo: () => void;
  onUploadClick: () => void;
  documentCount: number;
  isSeeding: boolean;
  geminiReady: boolean;
  gridActive: boolean;
}

export default function Navbar({
  onLoadDemo,
  onUploadClick,
  documentCount = 12,
  isSeeding = false,
  geminiReady = true,
  gridActive = true,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCursor, resetCursor } = useCursor();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Explore', href: '#explore' },
    { label: 'Archive', href: '#archive' },
    { label: 'About', href: '#about' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActiveTab(label);
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'dark:bg-[#070B14]/95 bg-white/95 backdrop-blur-md border-b dark:border-[#1B2945] border-slate-200 py-2.5 shadow-lg shadow-black/20'
          : 'dark:bg-transparent bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: ReTrace Logo matching Reference Image */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero', 'Home')}
          onMouseEnter={() => setCursor('RETRACE', 'button')}
          onMouseLeave={resetCursor}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          {/* Stylized Cyan 'R' icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight dark:text-white text-slate-900 leading-none">
              ReTrace
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-400 uppercase mt-0.5 font-bold">
              FORENSIC CONTEXT ENGINE
            </span>
          </div>
        </a>

        {/* Center: Clean Desktop Navigation with Active Indicator */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeTab === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.label)}
                onMouseEnter={() => setCursor('VIEW', 'button')}
                onMouseLeave={resetCursor}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? 'dark:text-white text-slate-900 font-bold'
                    : 'dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#38BDF8]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Status Badges, Theme Pill Toggle & Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* Status Indicators Pill */}
          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full dark:bg-[#0E1626]/80 bg-slate-100/90 border dark:border-[#1B2945] border-slate-200 text-xs font-mono backdrop-blur-md">
            {/* Grid Status */}
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${gridActive ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-bold dark:text-slate-300 text-slate-700">
                GRID ACTIVE
              </span>
            </span>

            <span className="text-slate-500 text-[10px]">│</span>

            {/* Document Count */}
            <span className="flex items-center space-x-1.5 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold dark:text-slate-200 text-slate-700">
                DOCS {documentCount}
              </span>
            </span>

            <span className="text-slate-500 text-[10px]">│</span>

            {/* Gemini Ready */}
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold text-cyan-400">
                GEMINI READY
              </span>
            </span>
          </div>

          {/* Theme Pill Toggle (Sun & Moon in rounded capsule) */}
          <button
            onClick={toggleTheme}
            onMouseEnter={() => setCursor(theme === 'dark' ? 'LIGHT' : 'DARK', 'button')}
            onMouseLeave={resetCursor}
            className="p-1.5 px-2 rounded-full dark:bg-[#0E1626]/80 bg-slate-100/90 border dark:border-[#1B2945] border-slate-200 flex items-center space-x-1.5 cursor-pointer hover:border-sky-400 transition-colors shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            <div className={`p-1 rounded-full transition-colors ${theme === 'light' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-500'}`}>
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'bg-sky-400 text-slate-950 shadow-sm' : 'text-slate-400'}`}>
              <Moon className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Try Demo Button */}
          <button
            onClick={onLoadDemo}
            disabled={isSeeding}
            onMouseEnter={() => setCursor('DEMO', 'button')}
            onMouseLeave={resetCursor}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold dark:text-white text-slate-900 dark:bg-slate-900/70 bg-white/90 hover:bg-slate-800 dark:border-slate-700 border-slate-300 border transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSeeding ? 'Seeding...' : 'Try Demo'}</span>
          </button>

          {/* Ingest Document (Cyan Solid Pill Button) */}
          <button
            onClick={onUploadClick}
            onMouseEnter={() => setCursor('INGEST', 'button')}
            onMouseLeave={resetCursor}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-cyan-400/25 active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full dark:bg-[#0E1626] bg-slate-100 border dark:border-[#1B2945] border-slate-200 text-slate-300"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-sky-500" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b dark:border-[#1B2945] border-slate-200 dark:bg-[#070B14] bg-white px-4 py-5 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.label)}
                  className="px-3 py-2 rounded-lg text-sm font-medium dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t dark:border-[#1B2945] border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoadDemo();
                }}
                className="w-full py-2.5 rounded-full text-xs font-semibold dark:text-white text-slate-900 border dark:border-slate-700 border-slate-300 flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Try Demo</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onUploadClick();
                }}
                className="w-full py-2.5 rounded-full text-xs font-bold text-slate-950 bg-cyan-400 flex items-center justify-center space-x-2 shadow-md shadow-cyan-400/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Document</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
