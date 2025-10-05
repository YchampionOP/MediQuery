import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Search, 
  Zap, 
  Shield, 
  BarChart3, 
  Brain, 
  Lock, 
  Database, 
  Users, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Play,
  Download,
  MessageSquare,
  FileText,
  Heart,
  Clock,
  Globe,
  Cpu,
  Sparkles,
  Bot,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const Features: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // State for demo video URL - to be updated by user
  const [demoVideoUrl, setDemoVideoUrl] = useState('https://drive.google.com/file/d/1234567890/view');

  const coreFeatures = [
    {
      id: 'hybrid-search',
      icon: Search,
      title: 'Hybrid AI Search Engine',
      description: 'Advanced search combining BM25, semantic search, and RRF (Reciprocal Rank Fusion) algorithms.',
      benefits: [
        'Sub-2-second response times',
        '99.3% search accuracy',
        'Natural language processing',
        'Multi-index search capabilities'
      ],
      gradient: 'from-[#0066CC] to-[#0052A3]',
      details: 'Our proprietary hybrid search engine combines traditional keyword matching with advanced semantic understanding, delivering the most relevant results from 173,270+ medical documents.'
    },
    {
      id: 'role-intelligence',
      icon: Brain,
      title: 'Role-Based Intelligence',
      description: 'AI that adapts responses based on user roles - clinicians get technical details, patients get simplified explanations.',
      benefits: [
        'Clinician-optimized results',
        'Patient-friendly explanations',
        'Context-aware responses',
        'Personalized recommendations'
      ],
      gradient: 'from-[#3B82F6] to-[#2563EB]',
      details: 'Smart AI that understands who you are and what you need. Clinicians receive detailed medical terminology and research data, while patients get clear, understandable health information.'
    },
    {
      id: 'rag-system',
      icon: Bot,
      title: 'Retrieval-Augmented Generation (RAG)',
      description: 'AI-powered responses grounded in real medical data with full source attribution and fact verification.',
      benefits: [
        'Evidence-based responses',
        'Source citation tracking',
        'Fact verification system',
        'Continuous learning updates'
      ],
      gradient: 'from-[#8B5CF6] to-[#7C3AED]',
      details: 'Our RAG system retrieves relevant medical documents and uses them to generate accurate, context-aware responses. Unlike generic AI, every answer is backed by real medical data with full source attribution.'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into search patterns, usage metrics, and system performance.',
      benefits: [
        'Real-time dashboards',
        'Usage pattern analysis',
        'Performance monitoring',
        'Custom reporting'
      ],
      gradient: 'from-[#0052A3] to-[#0066CC]',
      details: 'Get deep insights into how your organization uses medical search. Track trends, identify knowledge gaps, and optimize your healthcare workflows.'
    },
    {
      id: 'integration',
      icon: Database,
      title: 'Seamless Integration',
      description: 'Easy integration with existing EMR systems, FHIR compliance, and comprehensive API access.',
      benefits: [
        'FHIR R4 compliant',
        'RESTful API access',
        'EMR integration ready',
        'Real-time data sync'
      ],
      gradient: 'from-[#1D4ED8] to-[#0052A3]',
      details: 'Integrate seamlessly with your existing healthcare infrastructure. Our FHIR-compliant APIs ensure smooth data flow and interoperability.'
    },
    {
      id: 'performance',
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Optimized for speed with cloud-scale infrastructure delivering results in under 2 seconds.',
      benefits: [
        'Sub-2-second responses',
        '99.9% uptime SLA',
        'Auto-scaling infrastructure',
        'Global CDN delivery'
      ],
      gradient: 'from-[#0066CC] to-[#3B82F6]',
      details: 'Built on enterprise-grade cloud infrastructure with automatic scaling, ensuring fast, reliable access to medical information when you need it most.'
    }
  ];

  const technicalSpecs = [
    { label: 'Medical Documents', value: '173,270+', icon: FileText },
    { label: 'Search Accuracy', value: '99.3%', icon: CheckCircle },
    { label: 'Average Response', value: '<2 seconds', icon: Clock },
    { label: 'Uptime SLA', value: '99.9%', icon: Award },
    { label: 'Data Sources', value: '5+ Major DBs', icon: Database },
    { label: 'Concurrent Users', value: '10,000+', icon: Users }
  ];

  const dataSourcesDetails = [
    {
      name: 'MIMIC-III Clinical Database',
      description: 'Comprehensive de-identified health data from Beth Israel Deaconess Medical Center',
      records: '45,231 patients',
      highlights: ['Clinical notes', 'Lab results', 'Medications', 'ICU data']
    },
    {
      name: 'Research Papers Database',
      description: 'Curated medical research and clinical studies',
      records: '89,442 papers',
      highlights: ['PubMed integration', 'Clinical trials', 'Meta-analyses', 'Case studies']
    },
    {
      name: 'Medical Terminology',
      description: 'Standardized medical coding systems',
      records: '500,000+ codes',
      highlights: ['ICD-10 codes', 'SNOMED-CT', 'CPT codes', 'LOINC codes']
    }
  ];

  const useCases = [
    {
      title: 'Clinical Decision Support',
      description: 'Help clinicians make informed decisions with evidence-based recommendations',
      scenarios: [
        'Drug interaction checking',
        'Differential diagnosis support',
        'Treatment protocol guidance',
        'Risk assessment tools'
      ]
    },
    {
      title: 'Patient Education',
      description: 'Provide patients with clear, understandable health information',
      scenarios: [
        'Condition explanations',
        'Treatment options overview',
        'Medication information',
        'Preventive care guidance'
      ]
    },
    {
      title: 'Research & Analytics',
      description: 'Support medical research with comprehensive data analysis',
      scenarios: [
        'Population health studies',
        'Treatment outcome analysis',
        'Epidemiological research',
        'Quality improvement initiatives'
      ]
    }
  ];

  const handleWatchDemo = () => {
    // Open the demo video URL in a new tab
    window.open(demoVideoUrl, '_blank');
  };

  const handleTechnicalSpecs = () => {
    // Scroll to technical specifications section
    const element = document.getElementById('technical-specs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSales = () => {
    // Redirect to LinkedIn profile
    window.open('https://linkedin.com/in/yashasgunderia', '_blank');
  };

  const handleTrySearchDemo = () => {
    // Navigate to search page
    navigate('/search');
  };

  const handleLearnMore = (featureId: string) => {
    // Scroll to the data sources section as an example
    const element = document.getElementById('data-sources');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] transition-colors duration-200">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F9FAFB] via-white to-[#EFF6FF] dark:from-[#0A0A0B] dark:via-[#111827] dark:to-[#0F1629] py-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#0066CC] opacity-5 dark:opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-[#3B82F6] opacity-5 dark:opacity-10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] dark:bg-[#1F2937] rounded-full mb-6">
            <Sparkles size={16} className="text-[#0066CC] dark:text-[#3B82F6]" />
            <span className="text-sm font-semibold text-[#0066CC] dark:text-[#3B82F6]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enterprise Healthcare AI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-[#111827] dark:text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Platform <span className="bg-gradient-to-r from-[#0066CC] to-[#3B82F6] bg-clip-text text-transparent">Features</span>
          </h1>
          
          <p className="text-xl text-[#6B7280] dark:text-[#9CA3AF] max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Discover the advanced capabilities that make MediQuery AI the most powerful healthcare search platform available to medical professionals and patients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleWatchDemo}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white font-semibold text-base rounded-xl shadow-xl shadow-[#0066CC]/25 transition-all duration-200 hover:shadow-2xl hover:shadow-[#0066CC]/30 hover:-translate-y-1" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Play size={20} />
              Watch Demo
            </button>
            <button 
              onClick={handleTechnicalSpecs}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-[#1F2937] text-[#0066CC] dark:text-[#3B82F6] font-semibold text-base rounded-xl border-2 border-[#0066CC] dark:border-[#3B82F6] hover:bg-[#0066CC] hover:text-white dark:hover:bg-[#3B82F6] dark:hover:text-white transition-all duration-200" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Download size={20} />
              Technical Specs
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div id="technical-specs" className="py-16 px-6 bg-white dark:bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Technical Specifications
            </h2>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Built for scale, designed for healthcare
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technicalSpecs.map((spec, index) => {
              const IconComponent = spec.icon;
              return (
                <div key={index} className="text-center p-6 bg-[#F9FAFB] dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] hover:shadow-lg transition-all duration-200">
                  <IconComponent className="w-8 h-8 text-[#0066CC] dark:text-[#3B82F6] mx-auto mb-3" />
                  <div className="text-2xl font-bold text-[#111827] dark:text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {spec.value}
                  </div>
                  <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {spec.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="py-20 px-6 bg-[#F9FAFB] dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Core Features
            </h2>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF] max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Advanced AI capabilities designed specifically for healthcare professionals and patients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredFeature === feature.id;
              
              return (
                <div
                  key={feature.id}
                  className={`relative group cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
                    isHovered ? 'z-10' : ''
                  }`}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`h-full rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isHovered
                      ? `bg-gradient-to-br ${feature.gradient} border-transparent shadow-2xl`
                      : 'bg-white dark:bg-[#1F2937] border-[#E5E7EB] dark:border-[#374151] shadow-lg hover:shadow-xl'
                  }`}>
                    <div className="p-8">
                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-xl mb-6 transition-all duration-300 ${
                        isHovered
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-[#EFF6FF] dark:bg-[#374151]'
                      }`}>
                        <IconComponent
                          size={28}
                          className={`transition-colors duration-300 ${
                            isHovered
                              ? 'text-white'
                              : 'text-[#0066CC] dark:text-[#3B82F6]'
                          }`}
                        />
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                        isHovered
                          ? 'text-white'
                          : 'text-[#111827] dark:text-white'
                      }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className={`text-base mb-6 transition-colors duration-300 ${
                        isHovered
                          ? 'text-white/90'
                          : 'text-[#6B7280] dark:text-[#9CA3AF]'
                      }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {feature.description}
                      </p>
                      
                      {/* Benefits */}
                      <ul className="space-y-2 mb-6">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className={`flex items-center gap-2 text-sm ${
                            isHovered
                              ? 'text-white/80'
                              : 'text-[#6B7280] dark:text-[#9CA3AF]'
                          }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                            <CheckCircle size={16} className={isHovered ? 'text-white' : 'text-[#0066CC] dark:text-[#3B82F6]'} />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      
                      {/* Learn More */}
                      <div 
                        onClick={() => handleLearnMore(feature.id)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 cursor-pointer ${
                          isHovered
                            ? 'text-white'
                            : 'text-[#0066CC] dark:text-[#3B82F6]'
                        }`} 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Learn More
                        <ArrowRight size={16} className={`transition-transform duration-300 ${
                          isHovered ? 'translate-x-1' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div id="data-sources" className="py-20 px-6 bg-white dark:bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Comprehensive Data Sources
            </h2>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Access to the world's largest medical databases and research repositories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dataSourcesDetails.map((source, index) => (
              <div key={index} className="bg-[#F9FAFB] dark:bg-[#1F2937] rounded-xl p-8 border border-[#E5E7EB] dark:border-[#374151]">
                <div className="flex items-center justify-between mb-4">
                  <Database className="w-8 h-8 text-[#0066CC] dark:text-[#3B82F6]" />
                  <span className="text-sm font-semibold text-[#0066CC] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-[#374151] px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {source.records}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {source.name}
                </h3>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {source.description}
                </p>
                <ul className="space-y-2">
                  {source.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <CheckCircle size={16} className="text-[#0066CC] dark:text-[#3B82F6]" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RAG Value Proposition Enhancement */}
      <div className="py-20 px-6 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Why Our RAG System Stands Out
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Unlike generic AI assistants, our Retrieval-Augmented Generation system is specifically designed for healthcare with real medical data backing every response.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <Lightbulb className="w-12 h-12 text-yellow-300 mb-6" />
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Evidence-Based Responses
              </h3>
              <p className="text-white/90 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Every answer is grounded in real medical documents from trusted sources like MIMIC-III, ensuring accuracy and reliability.
              </p>
              <div className="text-sm font-semibold text-yellow-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                173,270+ Medical Documents
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <FileText className="w-12 h-12 text-green-300 mb-6" />
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Full Source Attribution
              </h3>
              <p className="text-white/90 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Know exactly where information comes from with complete source citations for every claim or recommendation.
              </p>
              <div className="text-sm font-semibold text-green-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                100% Transparent Sources
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <TrendingUp className="w-12 h-12 text-blue-300 mb-6" />
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Continuous Updates
              </h3>
              <p className="text-white/90 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our system continuously learns from new medical literature and research, keeping information current and relevant.
              </p>
              <div className="text-sm font-semibold text-blue-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                Real-Time Knowledge Updates
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-white/90 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              This is why healthcare professionals trust MediQuery AI - because every answer can be verified and traced back to authoritative medical sources.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-20 px-6 bg-[#F9FAFB] dark:bg-[#111827]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Real-World Use Cases
            </h2>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
              See how MediQuery AI transforms healthcare workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white dark:bg-[#1F2937] rounded-xl p-8 border border-[#E5E7EB] dark:border-[#374151] shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0066CC] to-[#3B82F6] rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {useCase.description}
                </p>
                <ul className="space-y-3">
                  {useCase.scenarios.map((scenario, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <CheckCircle size={16} className="text-[#0066CC] dark:text-[#3B82F6]" />
                      {scenario}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ready to Transform Your Healthcare Workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join thousands of healthcare professionals who trust MediQuery AI for their medical search needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleTrySearchDemo}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0066CC] font-semibold text-base rounded-xl shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-1" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Search size={20} />
              Try Search Demo
            </button>
            <button 
              onClick={handleContactSales}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-base rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-200" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <MessageSquare size={20} />
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;