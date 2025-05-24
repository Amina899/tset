import React, { useEffect, useState } from 'react';
import { Scan, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import StatCard from './StatCard';
import RiskDistributionChart from './RiskLevelDistribution';
import RiskTrends from './RiskTrends';
import PlatformDistributionChart from './PlatformDistributionChart.tsx';
import FilterPanel from './FilterPanel';
import PostList from './PostList';
import {
  FilterState,
  Post,
  DashboardStats,
  RiskDistribution,
  RiskTrendsData,
  PlatformDistribution,
  PieDataItem,
} from '../types.ts';

const Dashboard: React.FC = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    sources: [],
    riskLevels: [],
    timeRange: 'last_7_days',
    keywords: [],
  });

  const [stats, setStats] = useState({
    totalScanned: 0,
    highRiskAlerts: 0,
    moderatorActions: 0,
    helpAccepted: 0,
  });

  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({});
  const [timeSeries, setTimeSeries] = useState<RiskTrendsData>({
    LOW: [],
    MEDIUM: [],
    HIGH: [],
  });
  const [sourceDistribution, setSourceDistribution] = useState<PlatformDistribution[]>([]);

  // Normalize platform distribution from backend data
  const normalizePlatformDistribution = (obj: Record<string, number>): PlatformDistribution[] =>
    Object.entries(obj).map(([key, value]) => {
      const lowerKey = key.toLowerCase();
      let sources: PlatformDistribution['sources'];
      if (lowerKey === 'vk') sources = 'vk';
      else if (lowerKey === 'twitter') sources = 'twitter';
      else if (lowerKey === 'instagram') sources = 'instagram';
      else sources = 'twitter';
      return { sources, count: value };
    });

  // Normalize risk distribution keys for charts
  const normalizeRiskDistribution = (data: RiskDistribution): Record<string, number> => ({
    Low: data.LOW ?? 0,
    Medium: data.MEDIUM ?? 0,
    High: data.HIGH ?? 0,
  });

  // Process raw risk trends into chart-friendly format
  const processRiskTrends = (rawTrends: { LOW: number[]; MEDIUM: number[]; HIGH: number[] }): RiskTrendsData => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const processArray = (arr: number[]) =>
      arr.map((count, index) => ({
        timestamp: new Date(startTime.getTime() + index * 60 * 60 * 1000).toISOString(),
        count,
      }));

    return {
      LOW: processArray(rawTrends.LOW),
      MEDIUM: processArray(rawTrends.MEDIUM),
      HIGH: processArray(rawTrends.HIGH),
    };
  };

  // Fetch dashboard data from backend API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('time_range', filters.timeRange);

      const response = await fetch(`http://127.0.0.1:8000/api/dashboard/info?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response: ${text.slice(0, 100)}`);
      }

      const data: DashboardStats = await response.json();

      setStats({
        totalScanned: data.total_scanned_data_count,
        highRiskAlerts: data.high_risk_data_count,
        moderatorActions: data.moderator_actions_count,
        helpAccepted: data.help_accepted_count,
      });

      setTimeSeries(processRiskTrends(data.risk_trends));
      setSourceDistribution(normalizePlatformDistribution(data.platform_distribution || {}));
      setRiskDistribution(normalizeRiskDistribution(data.risk_level_distribution) as Record<string, number>);

      // Add extra computed fields for convenience
      const postsWithExtras = data.recent_last_fetched_data.map(post => ({
        ...post,
        riskLevel: post.suicide_level.toLowerCase() as 'low' | 'medium' | 'high',
        riskScore: post.suicide_percentage,
      }));

      setAllPosts(postsWithExtras);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on initial mount and whenever timeRange filter changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.timeRange]);

  // Local filtering by platform and risk level
  useEffect(() => {
    const filtered = allPosts.filter(post => {
      const platformMatch = filters.sources.length === 0 || filters.sources.includes(post.source);
      const riskMatch = filters.riskLevels.length === 0 || filters.riskLevels.includes(post.suicide_level.toLowerCase() as 'low' | 'medium' | 'high');
      return platformMatch && riskMatch;
    });
    setPosts(filtered);
  }, [allPosts, filters.sources, filters.riskLevels]);

  // Update filters from FilterPanel
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

const handleSendHelp = async (postId: string) => {
     if (!postId) {
    console.error('Invalid postId', postId);
    return;
    }
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/content_review/${postId}/help_sent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to send help');

    const updatedPost: Post = await response.json();

    // Обновляем весь список постов, меняя только один с новым статусом
    setAllPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, invention_outcomes_status: updatedPost.invention_outcomes_status }
          : post
      )
    );
  } catch (error) {
    console.error('Error sending help:', error);
    // Можно добавить уведомление об ошибке
  }
};


  // Handle flagging a post
  const handleFlag = (postId: string) => {
    alert(`Post ${postId} has been flagged for review`);
  };

  const riskDistributionArray: PieDataItem[] = ['Low', 'Medium', 'High'].map(key => ({
    name: key,
    value: riskDistribution[key as keyof RiskDistribution] || 0,
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {isLoading && <div className="loading-indicator">Loading...</div>}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Posts Scanned"
          value={stats.totalScanned.toLocaleString()}
          icon={Scan}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          change={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="High Risk Alerts"
          value={stats.highRiskAlerts}
          icon={AlertTriangle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
          change={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Moderator Actions"
          value={stats.moderatorActions}
          icon={Shield}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100"
          change={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Help Accepted"
          value={stats.helpAccepted}
          icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          change={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RiskDistributionChart data={riskDistributionArray} />
        <RiskTrends data={timeSeries} />
        <PlatformDistributionChart data={sourceDistribution} />
      </div>

      {/* Filter Panel */}
      <div className="mb-6">
        <FilterPanel onFilterChange={handleFilterChange} />
      </div>

      {/* Posts List */}
      <PostList posts={posts} onSendHelp={handleSendHelp} onFlag={handleFlag} />
    </div>
  );
};

export default Dashboard;
