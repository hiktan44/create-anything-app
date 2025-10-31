import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  Minus,
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

export default function MarketChangesTab({ company, filters }) {
  const [periodType, setPeriodType] = useState("yearly");
  const [compareView, setCompareView] = useState("volume");

  // Generate market changes data using AI
  const generateChangesMutation = useMutation({
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
                "You are a market analyst. Generate detailed market change data with period comparisons.",
            },
            {
              role: "user",
              content: `Generate market changes data for HS Code ${filters.hsCode} in ${filters.targetCountry}. Include yearly/monthly trends, volume changes, price fluctuations, and comparative analysis.`,
            },
          ],
          json_schema: {
            name: "market_changes",
            schema: {
              type: "object",
              properties: {
                yearlyChanges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      year: { type: "string" },
                      volume: { type: "number" },
                      value: { type: "number" },
                      price: { type: "number" },
                      volumeChange: { type: "number" },
                      valueChange: { type: "number" },
                      priceChange: { type: "number" },
                    },
                  },
                },
                monthlyChanges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      year: { type: "string" },
                      volume: { type: "number" },
                      value: { type: "number" },
                      price: { type: "number" },
                      volumeChange: { type: "number" },
                      valueChange: { type: "number" },
                      priceChange: { type: "number" },
                    },
                  },
                },
                comparisons: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      previousValue: { type: "number" },
                      currentValue: { type: "number" },
                      change: { type: "number" },
                      changeType: { type: "string" },
                    },
                  },
                },
              },
              required: ["yearlyChanges", "monthlyChanges", "comparisons"],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate changes data");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  // Auto-generate data when filters change
  useEffect(() => {
    if (filters.hsCode && filters.targetCountry) {
      generateChangesMutation.mutate();
    }
  }, [filters.hsCode, filters.targetCountry, filters.year]);

  const changesData = generateChangesMutation.data;
  const displayData =
    periodType === "yearly"
      ? changesData?.yearlyChanges
      : changesData?.monthlyChanges;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Market Changes Analysis
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodType("yearly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  periodType === "yearly"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Yearly
              </button>
              <button
                onClick={() => setPeriodType("monthly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  periodType === "monthly"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Monthly
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCompareView("volume")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  compareView === "volume"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setCompareView("value")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  compareView === "value"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Value
              </button>
              <button
                onClick={() => setCompareView("price")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  compareView === "price"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Price
              </button>
            </div>
          </div>
        </div>
      </div>

      {changesData && (
        <>
          {/* Trend Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {compareView.charAt(0).toUpperCase() + compareView.slice(1)}{" "}
                Changes Over Time
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export Chart
              </button>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={periodType === "yearly" ? "year" : "month"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={compareView}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  name={`${compareView.charAt(0).toUpperCase() + compareView.slice(1)}`}
                />
                <Line
                  type="monotone"
                  dataKey={`${compareView}Change`}
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Change %"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Changes Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {periodType === "yearly" ? "Yearly" : "Monthly"} Market
                  Changes
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {periodType === "yearly" ? "Year" : "Month"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume (tonnes)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value ($M)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price ($/kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {periodType === "yearly"
                          ? item.year
                          : `${item.month} ${item.year}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.volume?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.value?.toLocaleString()}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          {item.volumeChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : item.volumeChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`font-medium ${
                              item.volumeChange > 0
                                ? "text-green-600"
                                : item.volumeChange < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {item.volumeChange > 0 ? "+" : ""}
                            {item.volumeChange}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          {item.valueChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : item.valueChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`font-medium ${
                              item.valueChange > 0
                                ? "text-green-600"
                                : item.valueChange < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {item.valueChange > 0 ? "+" : ""}
                            {item.valueChange}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          {item.priceChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : item.priceChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`font-medium ${
                              item.priceChange > 0
                                ? "text-green-600"
                                : item.priceChange < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {item.priceChange > 0 ? "+" : ""}
                            {item.priceChange}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Country Comparisons */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Country Performance Comparison
              </h3>
            </div>

            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={changesData.comparisons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="previousValue"
                    fill="#94A3B8"
                    name="Previous Period"
                  />
                  <Bar
                    dataKey="currentValue"
                    fill="#3B82F6"
                    name="Current Period"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {generateChangesMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analyzing Market Changes
          </h3>
          <p className="text-gray-600">
            Calculating trends and changes for {filters.targetCountry}...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!changesData && !generateChangesMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Market Changes Analysis
          </h3>
          <p className="text-gray-600 mb-6">
            Select HS Code and Target Country to analyze market trends, volume
            changes, and price fluctuations over time.
          </p>
        </div>
      )}

      {/* Error State */}
      {generateChangesMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error: {generateChangesMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
