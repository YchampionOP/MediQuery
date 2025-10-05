import React, { useState } from 'react';
import './ResultSorting.css';

interface ResultSortingProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ResultSorting: React.FC<ResultSortingProps> = ({ onSortChange }) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'source', label: 'Source' }
  ];

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSortChange(newSortBy, sortOrder);
  };

  const handleOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="result-sorting">
      <span className="sort-label">Sort by:</span>
      
      <select 
        value={sortBy} 
        onChange={(e) => handleSortChange(e.target.value)}
        className="sort-select"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <button 
        className={`sort-order ${sortOrder}`}
        onClick={handleOrderChange}
        title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
};

export default ResultSorting;