import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface FetchResult {
  username: string;
  source: string;
  content: string;
  analyzed_at: string;
  suicide_level?: string;
  suicide_percentage?: number;
  language?: string;
  keywords?: string[];
}


const SocialMediaFetcher: React.FC = () => {
  const [platform, setPlatform] = useState<'twitter' | 'instagram' | 'vk'>('twitter');
  const [username, setUsername] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [results, setResults] = useState<FetchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialMediaContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let baseUrl = `http://18.205.158.112:8000/api/social_media/${platform}`;
      const params = new URLSearchParams();

      if (platform === 'instagram' && instagramUrl.trim()) {
        baseUrl += '/instagram_post';
        params.append('post_url', instagramUrl); 
      } else {
        params.append('username', username);
      }

      const response = await fetch(`${baseUrl}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      if (platform === 'vk') {
        const all: FetchResult[] = [];
        if (data.user_info) all.push(data.user_info);
        if (Array.isArray(data.wall)) all.push(...data.wall);
        setResults(all);
      } else if (platform === 'instagram') {
        setResults(data?.data || []);
      } else {
        setResults(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛰 Social Media Content Fetcher</h1>

      <form onSubmit={fetchSocialMediaContent} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as 'twitter' | 'instagram' | 'vk')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="vk">Vk</option>
          </select>
        </div>

        {platform === 'instagram' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@example"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Post URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@example"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || (!username && !instagramUrl)}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? 'Fetching...' : (
              <>
                <Search size={18} className="mr-2" />
                Fetch Content
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 text-red-800 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Fetched Results</h3>
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Username</p>
                    <p className="text-gray-800">{res.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Platform</p>
                    <p className="capitalize text-gray-800">{res.source}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 font-medium">Content</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{res.content}</p>
                  </div>
                  {'suicide_level' in res && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Suicide Level</p>
                        <p className="text-gray-800">{res.suicide_level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Risk %</p>
                        <p className="text-gray-800">{res.suicide_percentage}%</p>
                      </div>
                    </>
                  )}
                  {'keywords' in res && res.keywords && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 font-medium">Keywords</p>
                      <p className="text-gray-800">{res.keywords.join(', ')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Language</p>
                    <p className="text-gray-800">{res.language || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Analyzed At</p>
                    <p className="text-gray-800">{new Date(res.analyzed_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaFetcher;
