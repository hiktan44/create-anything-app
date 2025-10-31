"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  BarChart3,
  TrendingUp,
  Globe,
  Users,
  DollarSign,
  Package,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: user, loading } = useUser();
  const [timeRange, setTimeRange] = useState("6m");
  const [dataType, setDataType] = useState("revenue");

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["analytics", timeRange, dataType],
    queryFn: async () => {
      // Mock analytics data
      return {
        summary: {
          totalRevenue: 485600,
          revenueGrowth: 23.5,
          totalOrders: 142,
          ordersGrowth: 18.2,
          avgOrderValue: 3420,
          conversionRate: 4.8,
          topMarkets: ["Germany", "USA", "UK"],
          topProducts: ["Cotton T-Shirts", "Denim Jeans", "Leather Shoes"],
        },
        revenueData: [
          { month: "Jan", revenue: 42000, orders: 18, products: 24 },
          { month: "Feb", revenue: 38000, orders: 16, products: 26 },
          { month: "Mar", revenue: 45000, orders: 22, products: 28 },
          { month: "Apr", revenue: 52000, orders: 24, products: 30 },
          { month: "May", revenue: 48000, orders: 20, products: 32 },
          { month: "Jun", revenue: 62000, orders: 28, products: 35 },
        ],
        marketData: [
          { country: "Germany", value: 125000, percentage: 26 },
          { country: "USA", value: 110000, percentage: 23 },
          { country: "UK", value: 85000, percentage: 17 },
          { country: "France", value: 75000, percentage: 15 },
          { country: "Others", value: 90600, percentage: 19 },
        ],
        productData: [
          { product: "Cotton T-Shirts", sales: 85, revenue: 156000 },
          { product: "Denim Jeans", sales: 42, revenue: 124000 },
          { product: "Leather Shoes", sales: 28, revenue: 98000 },
          { product: "Sports Wear", sales: 35, revenue: 67000 },
          { product: "Accessories", sales: 22, revenue: 40600 },
        ],
      };
    },
    enabled: !!user,
  });

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm font-medium mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {change >= 0 ? "+" : ""}
              {change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access detailed analytics.
          </p>
          <a
            href="/account/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Advanced Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Comprehensive insights and reporting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Time Range:
              </span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Data Type:
              </span>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="products">Products</option>
              </select>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${analyticsData?.summary.totalRevenue?.toLocaleString() || "0"}`}
            change={analyticsData?.summary.revenueGrowth}
            color="blue"
          />
          <StatCard
            icon={Package}
            title="Total Orders"
            value={analyticsData?.summary.totalOrders?.toLocaleString() || "0"}
            change={analyticsData?.summary.ordersGrowth}
            color="green"
          />
          <StatCard
            icon={Target}
            title="Avg Order Value"
            value={`$${analyticsData?.summary.avgOrderValue?.toLocaleString() || "0"}`}
            change={null}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${analyticsData?.summary.conversionRate || "0"}%`}
            change={null}
            color="yellow"
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Market Distribution */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Market Distribution
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.marketData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ country, percentage }) =>
                      `${country} (${percentage}%)`
                    }
                  >
                    {analyticsData?.marketData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Top Products by Revenue
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData?.productData || []}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis
                    type="category"
                    dataKey="product"
                    stroke="#9CA3AF"
                    width={100}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Growth Trend</h4>
              </div>
              <p className="text-blue-800 text-sm">
                Revenue has increased by 23.5% compared to the previous period,
                with Germany leading as the top market.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-green-900">Top Performer</h4>
              </div>
              <p className="text-green-800 text-sm">
                Cotton T-Shirts generate the highest revenue with $156K in
                sales, maintaining strong demand across European markets.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold text-purple-900">
                  Market Opportunity
                </h4>
              </div>
              <p className="text-purple-800 text-sm">
                USA and UK markets show strong potential for expansion, with
                growing demand for sustainable fashion products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
