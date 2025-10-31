import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PriceAnalysisTab({ company, filters }) {
  const [viewType, setViewType] = useState("trend");

  const generatePriceAnalysisMutation = useMutation({
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
                "Generate detailed price analysis data for trade markets.",
            },
            {
              role: "user",
              content: `Generate price analysis for HS Code ${filters.hsCode} in ${filters.targetCountry}. Include price trends, min/max analysis, and monthly fluctuations.`,
            },
          ],
          json_schema: {
            name: "price_analysis",
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    averagePrice: { type: "number" },
                    minPrice: { type: "number" },
                    maxPrice: { type: "number" },
                    priceVolatility: { type: "number" },
                  },
                },
                monthlyPrices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      averagePrice: { type: "number" },
                      minPrice: { type: "number" },
                      maxPrice: { type: "number" },
                      change: { type: "number" },
                    },
                  },
                },
                countryPrices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      price: { type: "number" },
                      volume: { type: "number" },
                    },
                  },
                },
              },
              required: ["summary", "monthlyPrices", "countryPrices"],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate price analysis");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  useEffect(() => {
    if (filters.hsCode && filters.targetCountry) {
      generatePriceAnalysisMutation.mutate();
    }
  }, [filters.hsCode, filters.targetCountry]);

  const priceData = generatePriceAnalysisMutation.data;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Price Analysis
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewType("trend")}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                viewType === "trend"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Price Trends
            </button>
            <button
              onClick={() => setViewType("comparison")}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                viewType === "comparison"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Country Comparison
            </button>
          </div>
        </div>
      </div>

      {priceData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">
                  Average Price
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${priceData.summary.averagePrice?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">per unit</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Min Price</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${priceData.summary.minPrice?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">lowest recorded</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Max Price</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${priceData.summary.maxPrice?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">highest recorded</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">
                  Volatility
                </h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {priceData.summary.priceVolatility?.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">price variation</p>
            </div>
          </div>

          {/* Charts */}
          {viewType === "trend" ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Monthly Price Trends
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export Chart
                </button>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceData.monthlyPrices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averagePrice"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Average Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="minPrice"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Min Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="maxPrice"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Max Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Price Comparison by Country
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export Chart
                </button>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={priceData.countryPrices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="price" fill="#F59E0B" name="Price ($/unit)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Price Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Price Analysis
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priceData.monthlyPrices.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.averagePrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ${item.minPrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ${item.maxPrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          {item.change > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${item.change > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {item.change > 0 ? "+" : ""}
                            {item.change}%
                          </span>
                        </div>
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
      {generatePriceAnalysisMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analyzing Prices
          </h3>
          <p className="text-gray-600">
            Calculating price trends and analysis...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!priceData && !generatePriceAnalysisMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Price Analysis
          </h3>
          <p className="text-gray-600 mb-6">
            Select HS Code and Target Country to analyze price trends,
            volatility, and market pricing dynamics.
          </p>
        </div>
      )}

      {/* Error State */}
      {generatePriceAnalysisMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error: {generatePriceAnalysisMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
