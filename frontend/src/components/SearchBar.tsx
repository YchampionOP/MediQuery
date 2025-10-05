import React, { useState, useEffect } from 'react';
import { Search, Sparkles, User, Stethoscope } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  role: 'clinician' | 'patient';
  setRole: (role: 'clinician' | 'patient') => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  role,
  setRole,
  isLoading,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-[#111827] dark:text-white mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Search <span className="bg-gradient-to-r from-[#0066CC] to-[#3B82F6] bg-clip-text text-transparent">173,270+</span> Medical Documents
          </h1>
          <p 
            className="text-lg text-[#6B7280] dark:text-[#9CA3AF]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            AI-powered hybrid search across patients, diagnoses, lab results, and medications
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[#F3F4F6] dark:bg-[#1F2937] rounded-xl p-1">
            <button
              onClick={() => setRole('clinician')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                role === 'clinician'
                  ? 'bg-[#0066CC] text-white shadow-lg'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#374151] dark:hover:text-white'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Stethoscope size={18} />
              👨‍⚕️ Clinician
            </button>
            <button
              onClick={() => setRole('patient')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                role === 'patient'
                  ? 'bg-[#0066CC] text-white shadow-lg'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#374151] dark:hover:text-white'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <User size={18} />
              👤 Patient
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                role === 'clinician' 
                  ? "Search patients, diagnoses, lab results, medications..." 
                  : "Ask about symptoms, conditions, medications..."
              }
              className="w-full pl-16 pr-32 py-6 text-lg bg-white dark:bg-[#1F2937] border-2 border-[#E5E7EB] dark:border-[#374151] rounded-2xl shadow-xl focus:border-[#0066CC] dark:focus:border-[#3B82F6] focus:ring-4 focus:ring-[#0066CC]/10 dark:focus:ring-[#3B82F6]/10 focus:outline-none transition-all duration-200 text-[#111827] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF]"
              style={{ fontFamily: 'Inter, sans-serif' }}
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute inset-y-0 right-0 flex items-center pr-6 group"
            >
              <div className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                isLoading || !query.trim()
                  ? 'bg-[#E5E7EB] dark:bg-[#374151] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0066CC] to-[#0052A3] hover:from-[#0052A3] hover:to-[#0066CC] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Search</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>

        {/* Search Tips */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Try searching for: <span className="font-medium">"diabetic patients"</span>, <span className="font-medium">"abnormal glucose levels"</span>, or <span className="font-medium">"chest pain symptoms"</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SearchBar;