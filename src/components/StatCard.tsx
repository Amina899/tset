import React from 'react';
import { StatCardProps } from '../types';


const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  bgColor,
  change 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">from last 24h</span>
            </div>
          )}
        </div>
        
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;