import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <footer className="bg-[#111827] dark:bg-[#0A0A0B] text-white py-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0066CC] to-[#3B82F6] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                    MediQuery AI
                  </span>
                  <span className="text-xs text-gray-400 font-medium -mt-1">
                    by Ivance
                  </span>
                </div>
              </div>
              
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                Revolutionizing healthcare data retrieval with AI-powered search technology. 
                Making critical medical information accessible in seconds, not hours.
              </p>

              <div className="flex items-center gap-6">
                <a
                  href="https://github.com/YchampionOP/MediQuery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#0066CC] transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github size={24} />
                </a>
                <a
                  href="mailto:businessyashas@gmail.com"
                  className="text-gray-400 hover:text-[#0066CC] transition-colors duration-200"
                  aria-label="Email"
                >
                  <Mail size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/yashasgunderia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#0066CC] transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Search Demo', href: '/search' },
                  { name: 'Features', href: '/features' },
                  { name: 'About', href: '/about' },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Stack */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Powered By
              </h3>
              <ul className="space-y-3">
                {[
                  'Elasticsearch Cloud',
                  'React + TypeScript',
                  'Node.js Backend',
                  'Google Cloud Platform',
                  'MIMIC-III Database',
                ].map((tech) => (
                  <li key={tech}>
                    <span
                      className="text-gray-400"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {tech}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="border-t border-gray-700 pt-12 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#0066CC] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  173,270+
                </div>
                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Medical Documents
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0066CC] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  &lt;2s
                </div>
                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Average Response Time
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0066CC] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  60%
                </div>
                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Faster Than Traditional
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0066CC] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  HIPAA
                </div>
                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Compliant & Secure
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm text-center md:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="mb-2">
                  © 2025 MediQuery by{' '}
                  <span className="text-[#0066CC] font-semibold">Ivance (Yashas Gunderia)</span>
                  {' '}| Powered by Elastic and Google Cloud
                </p>
                <p className="text-xs">
                  Built for AI Accelerate Hackathon 2025 • MIMIC-III Clinical Database Integration
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Made with</span>
                <Heart size={16} className="text-red-500" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>for Healthcare</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;