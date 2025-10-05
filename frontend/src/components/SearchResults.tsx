import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Filter, 
  User, 
  FileText, 
  TestTube, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { SearchResult } from '../services/api';
import { exportService } from '../services/api';

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  searchQuery: string;
  role: 'clinician' | 'patient';
  showFiltersButton: boolean;
  onShowFilters: () => void;
  queryProcessing?: {
    originalQuery: string;
    processedQuery: string;
    entities: any[];
    intent: any;
    confidence: number;
  };
  // Add new props for pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onLoadMore?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalResults,
  searchTime,
  searchQuery,
  role,
  showFiltersButton,
  onShowFilters,
  queryProcessing,
  currentPage = 1,
  totalPages = Math.ceil(totalResults / 20),
  onPageChange = () => {},
  pageSize = 20,
  onLoadMore = () => {}
}) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<Record<string, boolean>>({});

  const toggleExpanded = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient': return { icon: User, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'clinical-note': return { icon: FileText, color: 'text-green-600', bg: 'bg-green-50' };
      case 'lab-result': return { icon: TestTube, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'medication': return { icon: Pill, color: 'text-orange-600', bg: 'bg-orange-50' };
      default: return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'patient': return 'Patient Record';
      case 'clinical-note': return 'Clinical Note';
      case 'lab-result': return 'Lab Result';
      case 'medication': return 'Medication';
      case 'research': return 'Research Paper';
      default: return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Function to view full record
  const viewFullRecord = (result: SearchResult) => {
    // For now, we'll just log the action and show an alert
    // In a real implementation, this would navigate to a detail page
    console.log('View full record:', result);
    alert(`Viewing full record for: ${result.title}\n\nIn a complete implementation, this would navigate to a detailed view of the record.`);
  };

  // Function to export record
  const exportRecord = async (result: SearchResult) => {
    try {
      setExporting(prev => ({ ...prev, [result.id]: true }));
      
      // Determine the index based on result type
      let index = '';
      switch (result.type) {
        case 'patient':
          index = 'patients';
          break;
        case 'clinical-note':
          index = 'clinical-notes';
          break;
        case 'lab-result':
          index = 'lab-results';
          break;
        case 'medication':
          index = 'medications';
          break;
        default:
          index = result.type;
      }
      
      // Call the export API
      const response = await exportService.exportAsPDF(index, result.id);
      
      // In a real implementation, this would download the actual PDF
      // For demo, we'll show the response data
      console.log('Export response:', response);
      
      // Create a simple text file with the record data for demo purposes
      const exportData = `Exported Record: ${result.title}

${JSON.stringify(response.data.content, null, 2)}

${response.data.message}`;
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Exported record: ${result.title}\n\n${response.data.message}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(prev => ({ ...prev, [result.id]: false }));
    }
  };

  if (!searchQuery) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div className="flex flex-col items-center justify-center py-32">
          <div className="text-8xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-[#111827] dark:text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ready to Search 173,270+ Documents
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-center max-w-md mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Use the search bar above or try one of our demo scenarios to see our AI-powered medical search in action.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Patients: 45,231</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Clinical Notes: 89,442</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Lab Results: 28,901</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Medications: 9,696</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div>
        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-2xl font-bold text-[#111827] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Search Results
              </h2>
              {showFiltersButton && (
                <button
                  onClick={onShowFilters}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
                >
                  <Filter size={16} />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              <div className="flex items-center gap-2">
                <Search size={16} />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">{totalResults.toLocaleString()}</span> results found
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">{searchTime}ms</span> search time
                </span>
              </div>
              <div className="px-2 py-1 bg-[#EFF6FF] dark:bg-[#1F2937] rounded-full">
                <span className="text-xs font-semibold text-[#0066CC] dark:text-[#3B82F6]">
                  {role === 'clinician' ? '👨‍⚕️ Clinician View' : '👤 Patient View'}
                </span>
              </div>
            </div>

            {/* Query Processing Info */}
            {queryProcessing && (
              <div className="mt-4 p-4 bg-[#F9FAFB] dark:bg-[#1F2937] rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-2">Query Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Original:</span>
                    <span className="ml-2 font-mono bg-white dark:bg-[#111827] px-2 py-1 rounded border">
                      {queryProcessing.originalQuery}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Processed:</span>
                    <span className="ml-2 font-mono bg-white dark:bg-[#111827] px-2 py-1 rounded border">
                      {queryProcessing.processedQuery}
                    </span>
                  </div>
                </div>
                {queryProcessing.confidence && (
                  <div className="mt-2">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF] text-xs">Confidence:</span>
                    <span className="ml-2 text-xs font-semibold text-[#0066CC]">
                      {(queryProcessing.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#111827] dark:text-white mb-2">No Results Found</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Try adjusting your search terms or filters, or use one of the demo scenarios above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => {
              const { icon: IconComponent, color, bg } = getResultIcon(result.type);
              const isExpanded = expandedResults.has(result.id);

              return (
                <div
                  key={result.id}
                  className="bg-white dark:bg-[#1F2937] rounded-xl border-2 border-[#E5E7EB] dark:border-[#374151] hover:border-[#0066CC] dark:hover:border-[#3B82F6] transition-all duration-200 hover:shadow-lg"
                >
                  {/* Result Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bg} dark:bg-opacity-20`}>
                          <IconComponent size={20} className={color} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>
                              {formatType(result.type)}
                            </span>
                            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                              Score: {result.relevanceScore.toFixed(2)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#111827] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {result.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(result.summary)}
                          className="p-2 text-[#6B7280] hover:text-[#0066CC] transition-colors"
                          title="Copy summary"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => toggleExpanded(result.id)}
                          className="p-2 text-[#6B7280] hover:text-[#0066CC] transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-[#374151] dark:text-[#D1D5DB] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {result.summary}
                    </p>

                    {/* Highlights */}
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-2">Relevant Excerpts:</h4>
                        <div className="space-y-2">
                          {result.highlights.slice(0, 3).map((highlight, index) => (
                            <div
                              key={index}
                              className="p-3 bg-[#FFFBEB] dark:bg-[#1F2937] border-l-4 border-[#F59E0B] rounded-r-lg"
                            >
                              <p 
                                className="text-sm text-[#374151] dark:text-[#D1D5DB]"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: highlight }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Quick View */}
                    <div className="flex flex-wrap gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      <span>Source: {result.source}</span>
                      {result.timestamp && (
                        <span>Updated: {new Date(result.timestamp).toLocaleDateString()}</span>
                      )}
                      {result.metadata?.department && (
                        <span>Department: {result.metadata.department}</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-[#E5E7EB] dark:border-[#374151] p-6 bg-[#F9FAFB] dark:bg-[#111827]">
                      <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3">Additional Details</h4>
                      
                      {/* Metadata */}
                      {result.metadata && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <div key={key} className="bg-white dark:bg-[#1F2937] p-3 rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                              <dt className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </dt>
                              <dd className="text-sm text-[#111827] dark:text-white font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </dd>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors text-sm"
                          onClick={() => viewFullRecord(result)}
                        >
                          <ExternalLink size={14} />
                          View Full Record
                        </button>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] dark:border-[#374151] text-[#374151] dark:text-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors text-sm"
                          onClick={() => exportRecord(result)}
                          disabled={exporting[result.id]}
                        >
                          <Download size={14} />
                          {exporting[result.id] ? 'Exporting...' : 'Export'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {results.length > 0 && results.length < totalResults && (
          <div className="text-center mt-12">
            <button 
              className="px-8 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors font-semibold"
              onClick={onLoadMore}
            >
              Load More Results
            </button>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2">
              Showing {results.length} of {totalResults.toLocaleString()} results
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;