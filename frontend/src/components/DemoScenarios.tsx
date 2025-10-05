import React from 'react';
import { Play, Zap } from 'lucide-react';

interface DemoScenario {
  title: string;
  query: string;
  role: 'clinician' | 'patient';
  description: string;
  icon: string;
}

interface DemoScenariosProps {
  onSelectScenario: (scenario: { query: string; role: 'clinician' | 'patient' }) => void;
}

const DemoScenarios: React.FC<DemoScenariosProps> = ({ onSelectScenario }) => {
  const scenarios: DemoScenario[] = [
    {
      title: "Diabetic Patients",
      query: "diabetic patients with complications",
      role: "clinician",
      description: "Find patients with diabetes and related complications",
      icon: "🩺"
    },
    {
      title: "Abnormal Lab Results",
      query: "recent abnormal lab results",
      role: "clinician", 
      description: "Search for recent laboratory test abnormalities",
      icon: "🧪"
    },
    {
      title: "Chest Pain Cases",
      query: "chest pain 45 year old male",
      role: "clinician",
      description: "Find similar chest pain cases for differential diagnosis",
      icon: "❤️"
    },
    {
      title: "Hypertension Medications",
      query: "hypertension medications side effects",
      role: "patient",
      description: "Learn about blood pressure medications and effects",
      icon: "💊"
    }
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] dark:bg-[#1F2937] rounded-full mb-4">
            <Zap size={16} className="text-[#0066CC] dark:text-[#3B82F6]" />
            <span className="text-sm font-semibold text-[#0066CC] dark:text-[#3B82F6]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Quick Demo Scenarios
            </span>
          </div>
          <h2 
            className="text-2xl md:text-3xl font-bold text-[#111827] dark:text-white mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Try These Sample Searches
          </h2>
          <p 
            className="text-base text-[#6B7280] dark:text-[#9CA3AF]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Click any scenario below to see our AI search in action
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => onSelectScenario({ query: scenario.query, role: scenario.role })}
              className="group relative p-6 bg-white dark:bg-[#1F2937] rounded-2xl border-2 border-[#E5E7EB] dark:border-[#374151] hover:border-[#0066CC] dark:hover:border-[#3B82F6] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2"
            >
              {/* Play Button Overlay */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 bg-[#0066CC] text-white rounded-full flex items-center justify-center">
                  <Play size={14} className="ml-0.5" />
                </div>
              </div>

              {/* Scenario Icon */}
              <div className="text-3xl mb-4">{scenario.icon}</div>

              {/* Role Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  scenario.role === 'clinician' 
                    ? 'bg-[#EFF6FF] text-[#0066CC] dark:bg-[#1E3A8A]/20 dark:text-[#3B82F6]'
                    : 'bg-[#F0FDF4] text-[#16A34A] dark:bg-[#14532D]/20 dark:text-[#22C55E]'
                }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {scenario.role === 'clinician' ? '👨‍⚕️ Clinician' : '👤 Patient'}
                </span>
              </div>

              {/* Title */}
              <h3 
                className="text-lg font-bold text-[#111827] dark:text-white mb-2 group-hover:text-[#0066CC] dark:group-hover:text-[#3B82F6] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {scenario.title}
              </h3>

              {/* Description */}
              <p 
                className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {scenario.description}
              </p>

              {/* Query Preview */}
              <div className="bg-[#F9FAFB] dark:bg-[#111827] p-3 rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                <p 
                  className="text-sm font-mono text-[#374151] dark:text-[#D1D5DB]"
                  style={{ fontFamily: 'Monaco, monospace' }}
                >
                  "{scenario.query}"
                </p>
              </div>

              {/* Hover Effect Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
            </button>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Each search demonstrates our hybrid AI technology combining{' '}
            <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">keyword</span>, {' '}
            <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">semantic</span>, and {' '}
            <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">RRF</span> search algorithms
          </p>
        </div>
      </div>
    </>
  );
};

export default DemoScenarios;