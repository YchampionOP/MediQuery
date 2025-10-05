import React from 'react';
import { UserRole } from '@types/index';
import './ResultFilters.css';

interface FilterState {
  resultTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  relevanceThreshold: number;
  sources: string[];
}

interface ResultFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  availableTypes: string[];
  availableSources: string[];
  userRole: UserRole;
}

const ResultFilters: React.FC<ResultFiltersProps> = ({
  filters,
  onFilterChange,
  availableTypes,
  availableSources,
  userRole
}) => {
  const handleTypeToggle = (type: string) => {
    const newTypes = filters.resultTypes.includes(type)
      ? filters.resultTypes.filter(t => t !== type)
      : [...filters.resultTypes, type];
    
    onFilterChange({ resultTypes: newTypes });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    
    onFilterChange({ sources: newSources });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFilterChange({
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleRelevanceChange = (value: number) => {
    onFilterChange({ relevanceThreshold: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      resultTypes: [],
      dateRange: { start: '', end: '' },
      relevanceThreshold: 0,
      sources: []
    });
  };

  const getTypeDisplayName = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFilterCount = () => {
    return filters.resultTypes.length + 
           filters.sources.length + 
           (filters.dateRange.start ? 1 : 0) + 
           (filters.dateRange.end ? 1 : 0) +
           (filters.relevanceThreshold > 0 ? 1 : 0);
  };

  return (
    <div className="result-filters">
      <div className="filters-header">
        <h4>Filters</h4>
        {getFilterCount() > 0 && (
          <button className="clear-filters" onClick={clearAllFilters}>
            Clear All ({getFilterCount()})
          </button>
        )}
      </div>

      {/* Result Types Filter */}
      <div className="filter-section">
        <h5>Result Types</h5>
        <div className="filter-options">
          {availableTypes.map(type => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.resultTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
              />
              <span className="checkmark"></span>
              {getTypeDisplayName(type)}
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="filter-section">
        <h5>Date Range</h5>
        <div className="date-range-inputs">
          <div className="date-input">
            <label>From:</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="date-input">
            <label>To:</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min={filters.dateRange.start}
            />
          </div>
        </div>
      </div>

      {/* Relevance Threshold Filter */}
      {userRole === 'clinician' && (
        <div className="filter-section">
          <h5>Minimum Relevance</h5>
          <div className="relevance-slider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.relevanceThreshold}
              onChange={(e) => handleRelevanceChange(parseFloat(e.target.value))}
            />
            <span className="relevance-value">
              {Math.round(filters.relevanceThreshold * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Sources Filter */}
      <div className="filter-section">
        <h5>Sources</h5>
        <div className="filter-options">
          {availableSources.map(source => (
            <label key={source} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.sources.includes(source)}
                onChange={() => handleSourceToggle(source)}
              />
              <span className="checkmark"></span>
              {source}
            </label>
          ))}
        </div>
      </div>

      {/* Quick Filters for Patients */}
      {userRole === 'patient' && (
        <div className="filter-section">
          <h5>Quick Filters</h5>
          <div className="quick-filters">
            <button 
              className={`quick-filter ${filters.resultTypes.includes('lab-result') ? 'active' : ''}`}
              onClick={() => handleTypeToggle('lab-result')}
            >
              🧪 Lab Results
            </button>
            <button 
              className={`quick-filter ${filters.resultTypes.includes('medication') ? 'active' : ''}`}
              onClick={() => handleTypeToggle('medication')}
            >
              💊 Medications
            </button>
            <button 
              className={`quick-filter ${filters.resultTypes.includes('clinical-note') ? 'active' : ''}`}
              onClick={() => handleTypeToggle('clinical-note')}
            >
              📋 Visit Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultFilters;