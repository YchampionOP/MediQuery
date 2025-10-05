import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Shield, BarChart3, Brain, Lock } from 'lucide-react';

const Features: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  const features = [
    {
      id: 'hybrid-search',
      icon: Search,
      title: 'Hybrid AI Search',
      description: 'Combines keyword, semantic, and RRF (Reciprocal Rank Fusion) for unmatched accuracy and relevance in medical data retrieval.',
      gradient: 'from-[#0066CC] to-[#0052A3]',
    },
    {
      id: 'lightning-fast',
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-2-second average response time powered by Elasticsearch and optimized AI models. Get answers when you need them.',
      gradient: 'from-[#3B82F6] to-[#2563EB]',
    },
    {
      id: 'role-based',
      icon: Brain,
      title: 'Role-Based Intelligence',
      description: 'Adaptive responses for clinicians and patients. The AI understands context and tailors information to your role.',
      gradient: 'from-[#0066CC] to-[#3B82F6]',
    },
    {
      id: 'enterprise-security',
      icon: Shield,
      title: 'Enterprise Security',
      description: 'HIPAA-compliant infrastructure with end-to-end encryption. Your patient data stays secure and private.',
      gradient: 'from-[#2563EB] to-[#1D4ED8]',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track search patterns, usage metrics, and system performance. Make data-driven decisions for your healthcare operations.',
      gradient: 'from-[#0052A3] to-[#0066CC]',
    },
    {
      id: 'compliance',
      icon: Lock,
      title: 'Full Compliance',
      description: 'Built to meet healthcare regulations including HIPAA, GDPR, and industry best practices. Audit logs included.',
      gradient: 'from-[#1D4ED8] to-[#0052A3]',
    },
  ];

  const handleExperienceDifference = () => {
    navigate('/search');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <section id="features" className="py-20 md:py-32 px-6 bg-white dark:bg-[#0A0A0B]">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] dark:bg-[#1F2937] rounded-full mb-6">
              <Zap size={16} className="text-[#0066CC] dark:text-[#3B82F6]" />
              <span className="text-sm font-semibold text-[#0066CC] dark:text-[#3B82F6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Enterprise Features
              </span>
            </div>

            <h2
              className="text-4xl md:text-6xl font-bold text-[#111827] dark:text-white mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Faster, Smarter, <span className="bg-gradient-to-r from-[#0066CC] to-[#3B82F6] bg-clip-text text-transparent">Better</span> Healthcare Decisions
            </h2>

            <p
              className="text-lg text-[#6B7280] dark:text-[#9CA3AF] max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Make informed decisions with real-time insights powered by cutting-edge AI technology and enterprise-grade infrastructure
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredCard === feature.id;

              return (
                <div
                  key={feature.id}
                  role="button"
                  tabIndex={0}
                  className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isHovered
                      ? 'border-transparent bg-gradient-to-br ' + feature.gradient + ' shadow-2xl -translate-y-2'
                      : 'border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] hover:border-[#0066CC] dark:hover:border-[#3B82F6] hover:shadow-xl'
                  }`}
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Glow Effect on Hover */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl mb-6 transition-all duration-300 ${
                      isHovered 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-[#EFF6FF] dark:bg-[#1F2937]'
                    }`}>
                      <IconComponent
                        size={28}
                        strokeWidth={2}
                        className={`transition-colors duration-300 ${
                          isHovered
                            ? 'text-white'
                            : 'text-[#0066CC] dark:text-[#3B82F6]'
                        }`}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                        isHovered
                          ? 'text-white'
                          : 'text-[#111827] dark:text-white'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-base leading-relaxed transition-colors duration-300 ${
                        isHovered
                          ? 'text-white/90'
                          : 'text-[#6B7280] dark:text-[#9CA3AF]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={handleExperienceDifference}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] hover:from-[#0052A3] hover:to-[#0066CC] text-white font-semibold text-base rounded-xl shadow-xl shadow-[#0066CC]/25 transition-all duration-200 hover:shadow-2xl hover:shadow-[#0066CC]/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Search size={20} />
              <span>Experience the Difference</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;