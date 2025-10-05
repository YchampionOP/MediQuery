import React from 'react';
import { UserRole } from '@types/index';

interface SearchResultsProps {
  userRole: UserRole;
}

const SearchResults: React.FC<SearchResultsProps> = ({ userRole }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Search Results</h1>
      <p>Advanced search interface for {userRole}s - Implementation pending</p>
      <p>This will include filtering, sorting, and detailed result views.</p>
    </div>
  );
};

export default SearchResults;