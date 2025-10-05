import React, { useState } from 'react';
import { SearchResult, SearchResponse, UserRole } from '@types/index';
import ResultCard from './ResultCard';
import ResultFilters from './ResultFilters';
import ResultSorting from './ResultSorting';
import ResultPagination from './ResultPagination';
import './SearchResults.css';

interface SearchResultsProps {
  searchResponse: SearchResponse;
  userRole: UserRole;
  onResultClick: (result: SearchResult) => void;
  onFilterChange: (filters: any) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

interface FilterState {
  resultTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  relevanceThreshold: number;
  sources: string[];
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResponse,
  userRole,
  onResultClick,
  onFilterChange,
  onSortChange,
  onPageChange,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'compact'>('card');
  const [filters, setFilters] = useState<FilterState>({
    resultTypes: [],
    dateRange: { start: '', end: '' },
    relevanceThreshold: 0.5,
    sources: []
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'patient': return '👤';
      case 'clinical-note': return '📋';
      case 'lab-result': return '🧪';
      case 'medication': return '💊';
      case 'research': return '📚';
      default: return '📄';
    }
  };

  const formatResultMetadata = (result: SearchResult) => {
    if (userRole === 'patient') {
      // Show simplified metadata for patients
      return {
        date: result.metadata.date || result.timestamp,
        type: result.type,
        source: result.source
      };
    }
    return result.metadata;
  };

  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>Searching medical records...</p>
      </div>
    );
  }

  if (!searchResponse.results.length) {
    return (
      <div className="search-results-empty">
        <h3>No results found</h3>
        <p>Try adjusting your search terms or filters</p>
        {searchResponse.suggestions.length > 0 && (
          <div className="search-suggestions">
            <h4>Suggestions:</h4>
            <ul>
              {searchResponse.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <div className="results-count">
          <h3>
            {searchResponse.totalResults.toLocaleString()} results 
            <span className="query-time">({searchResponse.queryTime}ms)</span>
          </h3>
        </div>
        
        <div className="results-controls">
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'card' ? 'active' : ''}
              onClick={() => setViewMode('card')}
              title="Card view"
            >
              📋
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              📝
            </button>
            <button
              className={viewMode === 'compact' ? 'active' : ''}
              onClick={() => setViewMode('compact')}
              title="Compact view"
            >
              📄
            </button>
          </div>
          
          <ResultSorting onSortChange={onSortChange} />
        </div>
      </div>

      <div className="search-results-content">
        <div className="results-sidebar">
          <ResultFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableTypes={Array.from(new Set(searchResponse.results.map(r => r.type)))}
            availableSources={Array.from(new Set(searchResponse.results.map(r => r.source)))}
            userRole={userRole}
          />
        </div>

        <div className="results-main">
          {searchResponse.conversationalResponse && (
            <div className="conversational-response">
              <h4>💬 Summary</h4>
              <p>{searchResponse.conversationalResponse}</p>
            </div>
          )}

          <div className={`results-grid ${viewMode}`}>
            {searchResponse.results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                userRole={userRole}
                viewMode={viewMode}
                onClick={() => onResultClick(result)}
                metadata={formatResultMetadata(result)}
              />
            ))}
          </div>

          <ResultPagination
            currentPage={currentPage}
            totalResults={searchResponse.totalResults}
            resultsPerPage={resultsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;