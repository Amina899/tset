import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RiskTrendsDataPoint, RiskTrendsProps } from "../types.ts";

const RiskTrends: React.FC<RiskTrendsProps> = ({ data }) => {
  // Transform backend format to chart-compatible format
  const chartData: RiskTrendsDataPoint[] = data.LOW.map((lowEntry, i) => ({
    time: new Date(lowEntry.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    }),
    lowRisk: data.LOW[i]?.count ?? 0,
    mediumRisk: data.MEDIUM[i]?.count ?? 0,
    highRisk: data.HIGH[i]?.count ?? 0,
  }));
  

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Risk Trends (Last 24 Hours)
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* Rest of your chart configuration remains the same */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="lowRisk"
              name="Low Risk"
              stroke="#10b981"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="mediumRisk"
              name="Medium Risk"
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="highRisk"
              name="High Risk"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskTrends;