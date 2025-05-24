import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ActivityTrends = {
  dates: string[];
  total_post: number[];
  high_risk: number[];
  intervention: number[];
  not_sent: number[];
};

type OutcomeDataItem = {
  name: string;
  value: number;
  color: string;
};

type AnalyticsData = {
  total_posts: number;
  high_risk_cases: number;
  interventions: number;
  accepted: number;
  success_rate_percent: number;
  activity_trends: ActivityTrends;
  average_response_time_minutes: number;
  active_moderators: number;
  posts_per_hour: number;
  keywords_detected: number;
  platform_coverage_percent: number;
  ai_accuracy_percent: number;
};

const COLORS = {
  accepted: "#10b981", // green
  not_sent: "#f59e0b", // amber
  declined: "#ef4444", // red
};

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("last_7_days");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/analytics/summary?time_range=${timeRange}`
        );
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  // Prepare data for trend chart
  const trendData =
    data && data.activity_trends
      ? data.activity_trends.dates.map((date, i) => ({
          date: format(parseISO(date), "MMM dd"),
          totalPosts: data.activity_trends.total_post[i],
          highRisk: data.activity_trends.high_risk[i],
          interventions: data.activity_trends.intervention[i],
          notSent: data.activity_trends.not_sent[i],
        }))
      : [];

  // Prepare data for intervention outcome pie chart
  const outcomeData: OutcomeDataItem[] = data
    ? [
        { name: "Accepted", value: data.accepted, color: COLORS.accepted },
        {
          name: "Not Sent",
          value: data.activity_trends.not_sent.reduce((a, b) => a + b, 0),
          color: COLORS.not_sent,
        },
        {
          name: "Declined",
          value: data.interventions - data.accepted,
          color: COLORS.declined,
        },
      ]
    : [];

  // Export PDF
  const exportPDF = (data: AnalyticsData) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Analytics Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Posts: ${data.total_posts}`, 14, 40);
    doc.text(`High Risk Cases: ${data.high_risk_cases}`, 14, 50);
    doc.text(`Interventions: ${data.interventions}`, 14, 60);
    doc.text(`Accepted: ${data.accepted}`, 14, 70);
    doc.text(`Success Rate: ${data.success_rate_percent.toFixed(2)}%`, 14, 80);
    doc.text(
      `Average Response Time: ${data.average_response_time_minutes.toFixed(2)} min`,
      14,
      90
    );
    doc.text(`Active Moderators: ${data.active_moderators}`, 14, 100);
    doc.text(`Posts per Hour: ${data.posts_per_hour.toFixed(2)}`, 14, 110);
    doc.text(`Keywords Detected: ${data.keywords_detected}`, 14, 120);
    doc.text(
      `Platform Coverage: ${data.platform_coverage_percent.toFixed(2)}%`,
      14,
      130
    );
    doc.text(`AI Accuracy: ${data.ai_accuracy_percent.toFixed(2)}%`, 14, 140);

    doc.save("analytics_report.pdf");
  };

  // Export Excel
  const exportExcel = (data: AnalyticsData) => {
    const wsData = [
      ["Metric", "Value"],
      ["Total Posts", data.total_posts],
      ["High Risk Cases", data.high_risk_cases],
      ["Interventions", data.interventions],
      ["Accepted", data.accepted],
      ["Success Rate (%)", data.success_rate_percent.toFixed(2)],
      ["Average Response Time (min)", data.average_response_time_minutes.toFixed(2)],
      ["Active Moderators", data.active_moderators],
      ["Posts per Hour", data.posts_per_hour.toFixed(2)],
      ["Keywords Detected", data.keywords_detected],
      ["Platform Coverage (%)", data.platform_coverage_percent.toFixed(2)],
      ["AI Accuracy (%)", data.ai_accuracy_percent.toFixed(2)],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "analytics_report.xlsx");
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="last_24_hours">Last 24 Hours</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_60_days">Last 60 Days</option>
          </select>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download size={18} />
              <span>Export Report</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    exportPDF(data);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    exportExcel(data);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          {
            title: "Total Posts",
            value: data.total_posts.toLocaleString(),
          },
          {
            title: "High Risk Cases",
            value: data.high_risk_cases.toLocaleString(),
          },
          {
            title: "Interventions",
            value: data.interventions.toLocaleString(),
          },
          {
            title: "Success Rate",
            value: `${data.success_rate_percent.toFixed(2)}%`,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
          >
            <h3 className="text-sm text-gray-500 font-medium">{stat.title}</h3>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Activity Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalPosts"
                  name="Total Posts"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="highRisk"
                  name="High Risk"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="interventions"
                  name="Interventions"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="notSent"
                  name="Not Sent"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intervention Outcomes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Intervention Outcomes
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: "Average Response Time",
              value: `${data.average_response_time_minutes.toFixed(2)} minutes`,
            },
            {
              label: "Active Moderators",
              value: data.active_moderators.toLocaleString(),
            },
            {
              label: "Posts per Hour",
              value: data.posts_per_hour.toFixed(2),
            },
            {
              label: "Keywords Detected",
              value: data.keywords_detected.toLocaleString(),
            },
            {
              label: "Platform Coverage",
              value: `${data.platform_coverage_percent.toFixed(2)}%`,
            },
            {
              label: "AI Accuracy",
              value: `${data.ai_accuracy_percent.toFixed(2)}%`,
            },
          ].map((stat, index) => (
            <div key={index} className="border-l-4 border-indigo-600 pl-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
