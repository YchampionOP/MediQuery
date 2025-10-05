import React from 'react';
import { AlertCircle, Clock, TrendingDown, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Problem: React.FC = () => {
  const navigate = useNavigate();

  const problems = [
    {
      icon: Clock,
      stat: '45+ seconds',
      label: 'Average Search Time',
      description: 'Traditional systems take too long to retrieve critical patient information',
    },
    {
      icon: TrendingDown,
      stat: '40% Loss',
      label: 'Productivity Impact',
      description: 'Clinical staff waste valuable time navigating complex database systems',
    },
    {
      icon: FileQuestion,
      stat: '173K+',
      label: 'Documents to Search',
      description: 'Finding the right information in massive medical databases is overwhelming',
    },
  ];

  const handleSeeInAction = () => {
    navigate('/search');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-[#F9FAFB] to-white dark:from-[#0F0F10] dark:to-[#0A0A0B]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 rounded-full mb-6">
              <AlertCircle size={16} className="text-[#DC2626]" />
              <span className="text-sm font-semibold text-[#DC2626]" style={{ fontFamily: 'Inter, sans-serif' }}>
                The Challenge
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl font-bold text-[#111827] dark:text-white mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Healthcare Data Retrieval is <span className="text-[#DC2626]">Broken</span>
            </h2>

            <p
              className="text-lg text-[#6B7280] dark:text-[#9CA3AF] max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Medical professionals spend countless hours searching through fragmented systems, delaying critical care decisions and impacting patient outcomes.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {problems.map((problem, index) => {
              const IconComponent = problem.icon;
              
              return (
                <div
                  key={index}
                  className="relative group p-8 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#FEE2E2] dark:border-[#7F1D1D] hover:border-[#DC2626] dark:hover:border-[#DC2626] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className="inline-flex p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 mb-4">
                    <IconComponent size={28} strokeWidth={2} className="text-[#DC2626]" />
                  </div>

                  {/* Stat */}
                  <div className="text-3xl font-bold text-[#DC2626] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {problem.stat}
                  </div>

                  {/* Label */}
                  <div className="text-sm font-semibold text-[#111827] dark:text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {problem.label}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {problem.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Solution Teaser */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] p-12 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                There's a Better Way
              </h3>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                MediQuery AI uses hybrid search technology to deliver results in under 2 seconds—60% faster than traditional systems.
              </p>
              <button
                onClick={handleSeeInAction}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0066CC] font-semibold text-base rounded-xl hover:bg-gray-50 shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0066CC]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span>See It in Action</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Problem;