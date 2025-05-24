import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MessageSquare, Shield } from 'lucide-react';
import { FilterState, Post } from '../types';

const ContentReview: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    sources: [],
    riskLevels: [],
    timeRange: 'last_24_hours',
    keywords: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query to avoid too many requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch posts when filters or debounced query change
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = '';
        if (debouncedQuery.trim().length > 0) {
          const encodedQuery = encodeURIComponent(debouncedQuery.trim());
          url = `http://18.205.158.112:8000/api/content_review/search?q=${encodedQuery}`;
        } else {
          const params = new URLSearchParams();
          if (filters.sources.length) {
            filters.sources.forEach(src => params.append('sources[]', src));
          }
          if (filters.riskLevels.length) {
            params.append('risk_levels', filters.riskLevels.join(','));
          }
          params.append('time_range', filters.timeRange);
          url = `http://18.205.158.112:8000/api/content_review/info?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filters, debouncedQuery]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Send help message and update post status
  const handleSendHelp = async (postId: string) => {
    try {
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, invention_outcomes_status: 'sent' } : post
      ));
      const response = await fetch(
        `http://18.205.158.112:8000/api/content_review/${postId}/help_sent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to send help');
      const updatedPost = await response.json();
      setPosts(posts.map(post => post._id === postId ? { ...post, ...updatedPost } : post));
    } catch {
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, invention_outcomes_status: 'not_sent' } : post
      ));
    }
  };

  // Toggle source filters
  const toggleSource = (source: 'twitter' | 'instagram' | 'vk') => {
    setFilters(f => ({
      ...f,
      sources: f.sources.includes(source) ? f.sources.filter(s => s !== source) : [...f.sources, source],
    }));
  };

  // Toggle risk level filters
  const toggleRiskLevel = (level: 'low' | 'medium' | 'high') => {
    setFilters(f => ({
      ...f,
      riskLevels: f.riskLevels.includes(level) ? f.riskLevels.filter(l => l !== level) : [...f.riskLevels, level],
    }));
  };

  // Filter posts client-side (redundant with backend filters but kept for UI consistency)
  const getFilteredPosts = () =>
    posts.filter(post => {
      if (filters.sources.length && !filters.sources.includes(post.source)) return false;
      const level = post.suicide_level.toLowerCase() as 'low' | 'medium' | 'high';
      if (filters.riskLevels.length && !filters.riskLevels.includes(level)) return false;
      return true;
    });

  const filteredPosts = getFilteredPosts();

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-2xl font-bold text-gray-800">Content Review</h1>
        <div className="flex space-x-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            {loading && (
              <div className="absolute right-2 top-2 text-sm text-gray-500 animate-pulse">
                Updating...
              </div>
            )}
          </div>
          <button
            onClick={() => setIsFilterOpen(prev => !prev)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>

          {isFilterOpen && (
            <div
              ref={filterRef}
              className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-[300px]"
            >
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Platforms</h3>
                {(['twitter', 'instagram', 'vk'] as const).map(source => (
                  <label key={source} className="inline-flex items-center mr-4 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="form-checkbox"
                    />
                    <span className="ml-2 capitalize">{source}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Risk Levels</h3>
                {(['low', 'medium', 'high'] as const).map(level => (
                  <label key={level} className="inline-flex items-center mr-4 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.riskLevels.includes(level)}
                      onChange={() => toggleRiskLevel(level)}
                      className="form-checkbox"
                    />
                    <span className="ml-2 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="p-4 text-red-600 bg-red-100 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <MessageSquare size={18} className="text-indigo-600 mr-2" />
            <h2 className="font-medium">Posts Queue ({filteredPosts.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredPosts.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">No posts found</div>
            )}
            {filteredPosts.map(post => (
              <div
                key={post._id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedPost?._id === post._id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.invention_outcomes_status === 'sent'
                      ? 'bg-blue-100 text-blue-800'
                      : post.invention_outcomes_status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : post.invention_outcomes_status === 'declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.invention_outcomes_status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      post.suicide_level === 'HIGH' ? 'bg-red-500' :
                      post.suicide_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium">{post.username}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.suicide_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                    post.suicide_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {post.suicide_level.charAt(0) + post.suicide_level.slice(1).toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7 bg-white rounded-lg shadow-md">
          {selectedPost ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{selectedPost.username}</h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="capitalize">{selectedPost.source}</span>
                    <span>•</span>
                    <span>{formatTimestamp(selectedPost.analyzed_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    selectedPost.suicide_level === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : selectedPost.suicide_level === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Risk Score: {selectedPost.suicide_percentage}%
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded-lg"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {selectedPost.keywords?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium mb-2">Keywords Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.keywords.map(keyword => (
                      <span key={keyword} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => handleSendHelp(selectedPost._id)}
                  disabled={selectedPost.invention_outcomes_status !== 'not_sent'}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Shield size={18} />
                  <span>
                    {selectedPost.invention_outcomes_status === 'sent' ? 'Help Sent' : 'Send Help Resources'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a post to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentReview;
