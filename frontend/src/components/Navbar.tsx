'use client';

import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowRight, UploadCloud, Compass, Search } from 'lucide-react';

interface NavbarProps {
  onTryDemo: () => void;
  onUploadClick: () => void;
}

export default function Navbar({ onTryDemo, onUploadClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Explore', href: '#explore' },
    { label: 'Archive', href: '#archive' },
    { label: 'About', href: '#about' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0A0F1D]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center space-x-1">
              <span>ReTrace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-0.5">
              Context Recovery
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons (Right) */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={onTryDemo}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Try Demo</span>
          </button>

          <button
            onClick={onUploadClick}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 shadow-md shadow-sky-500/20 transition-all flex items-center space-x-1.5 hover:scale-[1.02] active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Evidence</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0A0F1D]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTryDemo();
              }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-center bg-slate-800 text-white flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Try Demo</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onUploadClick();
              }}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-center bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 flex items-center justify-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Evidence</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
