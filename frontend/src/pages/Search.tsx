import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SearchFilters from "../components/SearchFilters";
import SearchResults from "../components/SearchResults";
import DemoScenarios from "../components/DemoScenarios";
import Footer from "../components/Footer";
import { Loader2 } from "lucide-react";
import { searchService, SearchRequest, SearchResponse } from '../services/api';
import { healthService } from '../services/api';

export interface SearchFilters {
  documentType: string[];
  dateRange: { start: string; end: string } | null;
  department: string[];
  priority: string[];
  ageRange: { min: number; max: number } | null;
  gender: string;
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<'clinician' | 'patient'>("clinician");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    documentType: [],
    dateRange: null,
    department: [],
    priority: [],
    ageRange: null,
    gender: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: healthService.checkHealth,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1,
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchQuery(query);
    setSearchError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const searchRequest: SearchRequest = {
        query: query.trim(),
        role,
        filters: {
          documentType: filters.documentType,
          dateRange: filters.dateRange,
          department: filters.department,
          priority: filters.priority,
          ageRange: filters.ageRange,
          gender: filters.gender || undefined,
        },
        size: pageSize,
        offset: 0,
      };

      const results = await searchService.search(searchRequest);
      setSearchResults(results);
    } catch (error: any) {
      console.error("Search failed:", error);
      setSearchError(
        error.response?.data?.message || 
        "Search failed. Please check if the backend is running."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!searchQuery.trim() || !searchResults) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const searchRequest: SearchRequest = {
        query: searchQuery.trim(),
        role,
        filters: {
          documentType: filters.documentType,
          dateRange: filters.dateRange,
          department: filters.department,
          priority: filters.priority,
          ageRange: filters.ageRange,
          gender: filters.gender || undefined,
        },
        size: pageSize,
        offset: currentPage * pageSize,
      };

      const results = await searchService.search(searchRequest);
      
      // Append new results to existing results
      setSearchResults(prev => {
        if (!prev) return results;
        return {
          ...results,
          results: [...prev.results, ...results.results],
          totalResults: results.totalResults // Keep the total from the new response
        };
      });
      
      setCurrentPage(prev => prev + 1);
    } catch (error: any) {
      console.error("Load more failed:", error);
      setSearchError(
        error.response?.data?.message || 
        "Failed to load more results. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleDemoScenario = (scenario: { query: string; role: 'clinician' | 'patient' }) => {
    setRole(scenario.role);
    handleSearch(scenario.query);
  };

  const isBackendHealthy = healthData?.status === 'healthy';

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0B] transition-colors duration-200">
      <Header />

      {/* Backend Status Indicator */}
      {!isBackendHealthy && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Backend connection issue detected. Some features may not work properly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Container for Desktop */}
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {/* Search Header Section */}
        <div className="mb-14">
          <SearchBar
            onSearch={handleSearch}
            role={role}
            setRole={setRole}
            isLoading={isSearching}
            initialQuery={searchQuery}
          />
          <div className="mt-8">
            <DemoScenarios onSelectScenario={handleDemoScenario} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[360px_1fr] gap-10">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="lg:block">
              <SearchFilters
                filters={filters}
                setFilters={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </aside>
          )}

          {/* Results Section */}
          <main
            className={`min-h-[600px] ${!showFilters ? "lg:col-span-2" : ""}`}
          >
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-20 h-20 text-[#0066CC] dark:text-[#3B82F6] animate-spin mb-6" />
                <p
                  className="text-xl text-[#6B7280] dark:text-[#9CA3AF] font-medium"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Searching 173,270+ medical documents...
                </p>
                <p
                  className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Using hybrid AI search (BM25 + Semantic + RRF)
                </p>
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="text-red-500 text-6xl mb-6">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                  Search Error
                </h3>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6 text-center max-w-md">
                  {searchError}
                </p>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <SearchResults
                results={searchResults?.results || []}
                totalResults={searchResults?.totalResults || 0}
                searchTime={searchResults?.took || 0}
                searchQuery={searchQuery}
                role={role}
                showFiltersButton={!showFilters}
                onShowFilters={() => setShowFilters(true)}
                queryProcessing={searchResults?.queryProcessing}
                currentPage={currentPage}
                onLoadMore={handleLoadMore}
                pageSize={pageSize}
              />
            )}
          </main>
        </div>
      </div>

      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
};

export default Search;