import { LucideProps } from 'lucide-react';
import React from 'react';

// Post interface matching your backend Post data structure
export interface Post {
  _id: string;
  content: string;
  source: 'twitter' | 'instagram' | 'vk';  
  type: 'post_text' | 'comment_text';
  analyzed_at: string;        
  suicide_percentage: number;          
  suicide_level: 'LOW' | 'MEDIUM' | 'HIGH';  
  keywords: string[];          
  username: string;
  language: string;
  invention_outcomes_status: 'not_sent' | 'declined' | 'accepted' | 'sent';
}


export interface RiskDistribution {
  LOW?: number;
  MEDIUM?: number;
  HIGH?: number;
  [key: string]: number | undefined; 
}


export interface PieDataItem {
  name: string;
  value: number;
}

export interface RiskDistributionChartProps {
  data: PieDataItem[];
}

export interface RiskTrendEntry {
  timestamp: string;
  count: number;
}

export interface RiskTrendsData {
  LOW: RiskTrendEntry[];
  MEDIUM: RiskTrendEntry[];
  HIGH: RiskTrendEntry[];
}


export interface RiskTrendsDataPoint {
  time: string;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export interface RiskTrendsResponse {
  LOW: { timestamp: string; count: number }[];
  MEDIUM: { timestamp: string; count: number }[];
  HIGH: { timestamp: string; count: number }[];
}

export interface RiskTrendsProps {
  data: RiskTrendsResponse;
}


export interface PlatformDistribution {
  sources: 'twitter' | 'instagram' | 'vk';
  count: number;
}


export type TimeRange = 
  | 'last_hour'
  | 'last_6_hours'
  | 'last_24_hours'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_60_days';

export interface FilterState {
  sources: ('twitter' | 'instagram' | 'vk')[];
  riskLevels: ('low' | 'medium' | 'high')[];
  timeRange: TimeRange;
  keywords: string[];
}




export interface DashboardStats {
  total_scanned_data_count: number;
  high_risk_data_count: number;
  moderator_actions_count: number;
  help_accepted_count: number;
  risk_level_distribution: RiskDistribution;
  risk_trends: { LOW: number[]; MEDIUM: number[]; HIGH: number[] };
  platform_distribution: Record<string, number>;
  recent_last_fetched_data: Post[];
}


export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<LucideProps>;
  iconColor: string;
  bgColor: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}