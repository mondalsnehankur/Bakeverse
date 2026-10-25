import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navLinkClass = ({ isActive }) => `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-lavender-200 dark:bg-lavender-900/60 text-berry-950 dark:text-purple-100' : 'text-berry-900/80 dark:text-purple-200/80 hover:bg-lavender-100 dark:hover:bg-mocha-800'}`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-mocha-900/95 backdrop-blur-md border-b border-lavender-100 dark:border-lavender-900/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lavender-400 via-lavender-300 to-sakura-200 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform"><span className="text-2xl">🧁</span></div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-berry-950 via-lavender-700 to-berry-900 dark:from-white dark:via-lavender-300 dark:to-lavender-400 bg-clip-text text-transparent">BakeVerse<span className="text-lavender-600 dark:text-lavender-400 ml-1 text-xl">AI</span></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-lavender-700 dark:text-purple-300 -mt-0.5">Multi-Bakery Marketplace</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 bg-lavender-50/90 dark:bg-mocha-800/80 p-1.5 rounded-full border border-lavender-200/60 dark:border-lavender-800/50">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/menu" className={navLinkClass}>Menu & Bakeries</NavLink>
        </nav>
        <button onClick={toggleTheme} className="p-2.5 rounded-full bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 dark:hover:bg-mocha-700 text-berry-900 dark:text-lavender-200 transition-colors" title={isDark ? 'Switch to light theme' : 'Switch to dark theme'} aria-label="Toggle theme">
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-lavender-700" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
