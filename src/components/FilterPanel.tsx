import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sources: [],
    riskLevels: [],
    timeRange: 'last_24_hours',
    keywords: []
  });
  
  const [keyword, setKeyword] = useState('');

  const toggleFilter = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePlatformChange = (sources: 'twitter' | 'instagram' | 'vk') => {
  const updatedPlatforms = filters.sources.includes(sources)
    ? filters.sources.filter(p => p !== sources)
    : [...filters.sources, sources];
    
    const updatedFilters = { ...filters, sources: updatedPlatforms };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleRiskLevelChange = (levels: 'low' | 'medium' | 'high') => {
  const updatedLevels = filters.riskLevels.includes(levels)
    ? filters.riskLevels.filter(l => l !== levels)
    : [...filters.riskLevels, levels];
    
    const updatedFilters = { ...filters, riskLevels: updatedLevels };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

    const handleTimeRangeChange = (timeRange: 'last_hour' | 'last_6_hours' | 'last_24_hours' | 'last_7_days') => {
    const updatedFilters = { ...filters, timeRange: timeRange };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };


  const addKeyword = () => {
    if (keyword && !filters.keywords.includes(keyword)) {
      const updatedKeywords = [...filters.keywords, keyword];
      const updatedFilters = { ...filters, keywords: updatedKeywords };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
      setKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = filters.keywords.filter(k => k !== keyword);
    const updatedFilters = { ...filters, keywords: updatedKeywords };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer border-b border-gray-200"
        onClick={toggleFilter}
      >
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-indigo-600" />
          <h3 className="font-MEDIUM">Filter Content</h3>
        </div>
        <div className="text-sm text-gray-500">
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Platform Filter */}
          <div>
            <h4 className="font-MEDIUM text-sm mb-2">Platform</h4>
            <div className="space-y-2">
              {(['twitter', 'instagram', 'vk'] as const).map((source) => (
                  <label key={source} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={filters.sources.includes(source)}
                      onChange={() => handlePlatformChange(source)} 
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm capitalize">{source}</span>
                  </label>
                ))}
            </div>
          </div>
          
          {/* Risk Level Filter */}
          <div>
            <h4 className="font-MEDIUM text-sm mb-2">Risk Level</h4>
            <div className="space-y-2">
              {(['low', 'medium', 'high'] as const).map(level => (
                <label key={level} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={filters.riskLevels.includes(level)}
                    onChange={() => handleRiskLevelChange(level)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Time Range Filter */}
          <div>
            <h4 className="font-MEDIUM text-sm mb-2">Time Range</h4>
            <div className="space-y-2">
              {(['last_hour', 'last_6_hours', 'last_24_hours', 'last_7_days'] as const).map(range => (
                <label key={range} className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    checked={filters.timeRange === range}
                    onChange={() => handleTimeRangeChange(range)}
                    className="rounded-full text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">
                    {range === 'last_hour' ? 'Last hour' : 
                    range === 'last_6_hours' ? 'Last 6 hours' : 
                    range === 'last_24_hours' ? 'Last 24 hours' : 
                    'Last 7 days'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Keywords Filter */}
          <div>
            <h4 className="font-MEDIUM text-sm mb-2">Keywords</h4>
            <div className="flex space-x-2 mb-2">
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Add keyword..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <button 
                onClick={addKeyword}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.keywords.map(kw => (
                <div key={kw} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs flex items-center">
                  {kw}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => removeKeyword(kw)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;