import React from 'react';
import { Filter, X, Calendar, Users, FileText, AlertTriangle } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../pages/Search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  setFilters: (filters: SearchFiltersType) => void;
  onClose: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, setFilters, onClose }) => {
  const documentTypes = [
    { id: 'patients', label: 'Patients', icon: '👤', count: '45,231' },
    { id: 'clinical-notes', label: 'Clinical Notes', icon: '📋', count: '89,442' },
    { id: 'lab-results', label: 'Lab Results', icon: '🧪', count: '28,901' },
    { id: 'medications', label: 'Medications', icon: '💊', count: '9,696' },
  ];

  const departments = [
    { id: 'cardiology', label: 'Cardiology' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'internal-medicine', label: 'Internal Medicine' },
    { id: 'surgery', label: 'Surgery' },
    { id: 'pediatrics', label: 'Pediatrics' },
    { id: 'neurology', label: 'Neurology' },
  ];

  const priorities = [
    { id: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
    { id: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
  ];

  const handleDocumentTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.documentType, typeId]
      : filters.documentType.filter(t => t !== typeId);
    
    setFilters({ ...filters, documentType: newTypes });
  };

  const handleDepartmentChange = (deptId: string, checked: boolean) => {
    const newDepts = checked 
      ? [...filters.department, deptId]
      : filters.department.filter(d => d !== deptId);
    
    setFilters({ ...filters, department: newDepts });
  };

  const handlePriorityChange = (priorityId: string, checked: boolean) => {
    const newPriorities = checked 
      ? [...filters.priority, priorityId]
      : filters.priority.filter(p => p !== priorityId);
    
    setFilters({ ...filters, priority: newPriorities });
  };

  const clearAllFilters = () => {
    setFilters({
      documentType: [],
      dateRange: null,
      department: [],
      priority: [],
      ageRange: null,
      gender: '',
    });
  };

  const activeFiltersCount = 
    filters.documentType.length + 
    filters.department.length + 
    filters.priority.length + 
    (filters.dateRange ? 1 : 0) + 
    (filters.ageRange ? 1 : 0) + 
    (filters.gender ? 1 : 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="sticky top-24">
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border-2 border-[#E5E7EB] dark:border-[#374151] shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-[#0066CC] dark:text-[#3B82F6]" />
              <h3 className="text-lg font-bold text-[#111827] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <span className="bg-[#0066CC] text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#6B7280] hover:text-[#0066CC] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-[#6B7280] hover:text-[#111827] dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Document Types */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <FileText size={16} />
              Document Type
            </h4>
            <div className="space-y-3">
              {documentTypes.map((type) => (
                <label key={type.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.documentType.includes(type.id)}
                      onChange={(e) => handleDocumentTypeChange(type.id, e.target.checked)}
                      className="w-4 h-4 text-[#0066CC] bg-gray-100 border-gray-300 rounded focus:ring-[#0066CC] focus:ring-2"
                    />
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB] group-hover:text-[#0066CC] dark:group-hover:text-[#3B82F6] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {type.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                    {type.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Calendar size={16} />
              Date Range
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {
                      start: e.target.value,
                      end: filters.dateRange?.end || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] dark:border-[#374151] rounded-lg bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {
                      start: filters.dateRange?.start || '',
                      end: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] dark:border-[#374151] rounded-lg bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Users size={16} />
              Demographics
            </h4>
            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] dark:border-[#374151] rounded-lg bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
                >
                  <option value="">All</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageRange?.min || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      ageRange: {
                        min: parseInt(e.target.value) || 0,
                        max: filters.ageRange?.max || 100
                      }
                    })}
                    className="px-3 py-2 text-sm border border-[#D1D5DB] dark:border-[#374151] rounded-lg bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageRange?.max || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      ageRange: {
                        min: filters.ageRange?.min || 0,
                        max: parseInt(e.target.value) || 100
                      }
                    })}
                    className="px-3 py-2 text-sm border border-[#D1D5DB] dark:border-[#374151] rounded-lg bg-white dark:bg-[#111827] text-[#111827] dark:text-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Department */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Department
            </h4>
            <div className="space-y-2">
              {departments.map((dept) => (
                <label key={dept.id} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.department.includes(dept.id)}
                    onChange={(e) => handleDepartmentChange(dept.id, e.target.checked)}
                    className="w-4 h-4 text-[#0066CC] bg-gray-100 border-gray-300 rounded focus:ring-[#0066CC] focus:ring-2 mr-3"
                  />
                  <span className="text-sm text-[#374151] dark:text-[#D1D5DB] group-hover:text-[#0066CC] dark:group-hover:text-[#3B82F6] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {dept.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <h4 className="text-sm font-semibold text-[#111827] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <AlertTriangle size={16} />
              Priority
            </h4>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <label key={priority.id} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority.id)}
                    onChange={(e) => handlePriorityChange(priority.id, e.target.checked)}
                    className="w-4 h-4 text-[#0066CC] bg-gray-100 border-gray-300 rounded focus:ring-[#0066CC] focus:ring-2 mr-3"
                  />
                  <span className={`text-sm px-2 py-1 rounded-full font-medium ${priority.color} transition-colors`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchFilters;