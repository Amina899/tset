import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RiskDistributionChartProps } from '../types';

const COLORS: Record<string, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

const RISK_LABELS = ['Low', 'Medium', 'High'];

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  // фильтрация данных - только с value > 0
  const filteredData = data.filter((entry: { name: string; value: number }) => entry.value > 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={filteredData.length === 1 ? 50 : 60}
              outerRadius={filteredData.length === 1 ? 90 : 80}
              paddingAngle={filteredData.length === 1 ? 0 : 5}
              dataKey="value"
              label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {filteredData.map((entry: { name: string; value: number }) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#ccc'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {RISK_LABELS.map((label) => {
          if (!filteredData.find((d) => d.name === label)) return null;
          return (
            <div key={label} className="flex items-center">
              <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[label] }}></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskDistributionChart;
