import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Search', href: '/search', current: location.pathname === '/search' },
    { name: 'Features', href: '/features', current: location.pathname === '/features' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
  ];

  return (
    <header className={`relative bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 ${className}`}>
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#0066CC] to-[#3B82F6] rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <div 
                className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                MediQuery
              </div>
              <div 
                className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                AI Healthcare Search
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-[#0066CC] text-white shadow-lg'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0066CC] dark:hover:text-[#3B82F6] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Search CTA - Desktop */}
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Search className="w-4 h-4" />
              Search Now
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0A0A0B] border-b border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-[#0066CC] text-white shadow-lg'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0066CC] dark:hover:text-[#3B82F6] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search CTA */}
              <Link
                to="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white font-semibold text-base rounded-lg shadow-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Search className="w-5 h-5" />
                Search Medical Data
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}