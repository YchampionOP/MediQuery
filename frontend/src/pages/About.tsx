import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Github, Linkedin, Award, Users, Code, Database } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] transition-colors duration-200">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111827] dark:text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            About <span className="bg-gradient-to-r from-[#0066CC] to-[#3B82F6] bg-clip-text text-transparent">MediQuery AI</span>
          </h1>
          <p className="text-xl text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Built for the AI Accelerate Hackathon 2025, MediQuery AI represents the future of healthcare data retrieval.
          </p>
        </div>

        {/* Project Overview */}
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#111827] dark:text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Project Overview
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-[#374151] dark:text-[#D1D5DB] leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              MediQuery AI is an advanced healthcare search platform that leverages artificial intelligence to revolutionize 
              how medical professionals access and retrieve critical patient information. Built with cutting-edge hybrid search 
              technology, it combines keyword search, semantic understanding, and Reciprocal Rank Fusion (RRF) to deliver 
              unprecedented accuracy and speed.
            </p>
            <p className="text-[#374151] dark:text-[#D1D5DB] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              The platform addresses a critical problem in healthcare: medical professionals waste up to 40% of their time 
              searching through fragmented systems. MediQuery AI reduces this time by 60%, enabling faster clinical decisions 
              and ultimately improving patient outcomes.
            </p>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Database, stat: '173,270+', label: 'Medical Documents', desc: 'From MIMIC-III Clinical Database' },
            { icon: Users, stat: '<2s', label: 'Average Response', desc: '60% faster than traditional systems' },
            { icon: Award, stat: '99.9%', label: 'Uptime SLA', desc: 'Enterprise-grade reliability' }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-[#F9FAFB] dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151]">
              <item.icon className="w-12 h-12 text-[#0066CC] dark:text-[#3B82F6] mx-auto mb-4" />
              <div className="text-3xl font-bold text-[#111827] dark:text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.stat}
              </div>
              <div className="text-sm font-semibold text-[#111827] dark:text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Technical Architecture */}
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#111827] dark:text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Technical Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Backend Infrastructure
              </h3>
              <ul className="space-y-2 text-[#374151] dark:text-[#D1D5DB]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>• Elasticsearch Cloud for hybrid search</li>
                <li>• Node.js + TypeScript backend</li>
                <li>• RESTful API with comprehensive endpoints</li>
                <li>• Real-time data processing</li>
                <li>• HIPAA-compliant security measures</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Frontend Experience
              </h3>
              <ul className="space-y-2 text-[#374151] dark:text-[#D1D5DB]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>• React + TypeScript with Vite</li>
                <li>• Tailwind CSS for modern design</li>
                <li>• Real-time search with debouncing</li>
                <li>• Role-based user interfaces</li>
                <li>• Responsive desktop-optimized design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-gradient-to-br from-[#0066CC] to-[#0052A3] rounded-2xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Data Sources & Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                MIMIC-III Clinical Database
              </h3>
              <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Comprehensive de-identified health data from Beth Israel Deaconess Medical Center, 
                including patient records, clinical notes, laboratory results, and medication data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Security & Compliance
              </h3>
              <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Built with HIPAA compliance in mind, featuring end-to-end encryption, 
                secure API endpoints, and comprehensive audit logging for healthcare environments.
              </p>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#111827] dark:text-white mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Meet the Developer
          </h2>
          <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-8 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0066CC] to-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">YG</span>
            </div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Yashas Gunderia
            </h3>
            <p className="text-[#0066CC] dark:text-[#3B82F6] font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Founder & Lead Developer, Ivance
            </p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Passionate about leveraging AI and technology to solve real-world healthcare challenges. 
              Experienced in full-stack development, AI/ML, and cloud infrastructure.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/YchampionOP"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0066CC] dark:hover:text-[#3B82F6] rounded-lg transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/yashasgunderia"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0066CC] dark:hover:text-[#3B82F6] rounded-lg transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:businessyashas@gmail.com"
                className="p-3 bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0066CC] dark:hover:text-[#3B82F6] rounded-lg transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;