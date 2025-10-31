import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Globe,
  TrendingUp,
  BarChart3,
  DollarSign,
  Package,
  Users,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MarketOverviewTab({ company, filters }) {
  const [selectedView, setSelectedView] = useState("yearly");

  // Generate market overview data using AI
  const generateOverviewMutation = useMutation({
    mutationFn: async () => {
      if (!filters.hsCode || !filters.targetCountry) {
        throw new Error("HS Code and Target Country are required");
      }

      const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a trade analyst. Generate comprehensive market overview data with statistics and trends.",
            },
            {
              role: "user",
              content: `Generate market overview data for HS Code ${filters.hsCode} in ${filters.targetCountry} for ${filters.year}. Include trade volumes, growth trends, market statistics, and time series data.`,
            },
          ],
          json_schema: {
            name: "market_overview",
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalImports: { type: "number" },
                    totalExports: { type: "number" },
                    marketShare: { type: "number" },
                    growthRate: { type: "number" },
                    avgPrice: { type: "number" },
                    totalVolume: { type: "number" },
                  },
                },
                timeSeriesData: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      imports: { type: "number" },
                      exports: { type: "number" },
                      price: { type: "number" },
                    },
                  },
                },
                countryShares: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      value: { type: "number" },
                      percentage: { type: "number" },
                    },
                  },
                },
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      value: { type: "number" },
                      change: { type: "number" },
                    },
                  },
                },
              },
              required: [
                "summary",
                "timeSeriesData",
                "countryShares",
                "trends",
              ],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate overview data");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  // Auto-generate data when filters change
  useEffect(() => {
    if (filters.hsCode && filters.targetCountry) {
      generateOverviewMutation.mutate();
    }
  }, [filters.hsCode, filters.targetCountry, filters.year]);

  const overviewData = generateOverviewMutation.data;

  // Chart colors
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Imports
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${overviewData.summary.totalImports?.toLocaleString()}M
            </p>
            <p className="text-sm text-green-600 mt-1">
              +{overviewData.summary.growthRate}% vs last year
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Exports
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${overviewData.summary.totalExports?.toLocaleString()}M
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Market Share: {overviewData.summary.marketShare}%
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Average Price
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${overviewData.summary.avgPrice?.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">per unit</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Volume
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {overviewData.summary.totalVolume?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">metric tons</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {overviewData && (
        <>
          {/* Time Series Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Trade Volume Trends
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedView("yearly")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    selectedView === "yearly"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setSelectedView("monthly")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    selectedView === "monthly"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={overviewData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="imports"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Imports ($M)"
                />
                <Area
                  type="monotone"
                  dataKey="exports"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Exports ($M)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Country Market Share & Price Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Share Pie Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Market Share by Country
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overviewData.countryShares}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ country, percentage }) =>
                      `${country}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {overviewData.countryShares.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Price Trends */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Price Trends
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overviewData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Price ($/unit)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trends Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Performance Trends
                  </h3>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value ($M)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overviewData.trends.map((trend, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trend.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${trend.value?.toLocaleString()}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`w-4 h-4 ${trend.change > 0 ? "text-green-600" : "text-red-600"}`}
                          />
                          <span
                            className={`font-medium ${trend.change > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {trend.change > 0 ? "+" : ""}
                            {trend.change}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trend.change > 5
                              ? "bg-green-100 text-green-800"
                              : trend.change > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trend.change > 5
                            ? "Strong Growth"
                            : trend.change > 0
                              ? "Growing"
                              : "Declining"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {generateOverviewMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Market Overview
          </h3>
          <p className="text-gray-600">
            Analyzing market data for {filters.targetCountry}...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!overviewData && !generateOverviewMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Market Overview
          </h3>
          <p className="text-gray-600 mb-6">
            Select HS Code and Target Country in the filters above to view
            comprehensive market statistics and trends.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Trade Volume Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Growth Trends</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Market Share</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {generateOverviewMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error: {generateOverviewMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
