import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Target,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
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
} from "recharts";

export default function AIPredictionsTab({ company, filters }) {
  const [selectedPredictionType, setSelectedPredictionType] =
    useState("market_forecast");
  const [selectedPeriod, setSelectedPeriod] = useState("3_months");
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: predictionsData, isLoading } = useQuery({
    queryKey: [
      "ai-predictions",
      company?.id,
      selectedPredictionType,
      selectedPeriod,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        company_id: company.id,
        type: selectedPredictionType,
        period: selectedPeriod,
      });
      const res = await fetch(`/api/ai-predictions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const generatePredictionMutation = useMutation({
    mutationFn: async (predictionData) => {
      const res = await fetch("/api/ai-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionData),
      });
      if (!res.ok) throw new Error("Failed to generate prediction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ai-predictions"]);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("Prediction generation failed:", error);
      setIsGenerating(false);
    },
  });

  const handleGeneratePrediction = async () => {
    setIsGenerating(true);

    const predictionData = {
      company_id: company.id,
      prediction_type: selectedPredictionType,
      target_market: filters.targetCountry,
      product_category: "General",
      hs_code: filters.hsCode,
      period: selectedPeriod,
      market_data: {
        year: filters.year,
        month: filters.month,
        exporter_country: filters.exporterCountry,
      },
    };

    generatePredictionMutation.mutate(predictionData);
  };

  const predictionTypes = [
    {
      id: "market_forecast",
      name: "Market Forecast",
      icon: TrendingUp,
      description: "Predict market size and growth trends",
      color: "blue",
    },
    {
      id: "price_trend",
      name: "Price Analysis",
      icon: DollarSign,
      description: "Forecast price movements and volatility",
      color: "green",
    },
    {
      id: "demand_prediction",
      name: "Demand Forecast",
      icon: BarChart3,
      description: "Analyze consumer demand patterns",
      color: "purple",
    },
  ];

  const periods = [
    { id: "1_month", name: "1 Month", duration: "30 days" },
    { id: "3_months", name: "3 Months", duration: "90 days" },
    { id: "6_months", name: "6 Months", duration: "180 days" },
    { id: "1_year", name: "1 Year", duration: "365 days" },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceIcon = (score) => {
    if (score >= 0.8) return CheckCircle;
    if (score >= 0.6) return AlertTriangle;
    return AlertTriangle;
  };

  const getTrendIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case "increase":
      case "growth":
      case "rising":
        return ArrowUp;
      case "decrease":
      case "decline":
      case "falling":
        return ArrowDown;
      default:
        return Minus;
    }
  };

  const renderPredictionCard = (prediction) => {
    const predictionData = prediction.prediction_data;
    const ConfidenceIcon = getConfidenceIcon(prediction.confidence_score);

    return (
      <div
        key={prediction.id}
        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${colorClasses[predictionTypes.find((t) => t.id === prediction.prediction_type)?.color || "blue"]}`}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {
                  predictionTypes.find(
                    (t) => t.id === prediction.prediction_type,
                  )?.name
                }
              </h4>
              <p className="text-sm text-gray-600">
                {prediction.target_market || "Global Market"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceIcon
              className={`w-5 h-5 ${getConfidenceColor(prediction.confidence_score)}`}
            />
            <span
              className={`text-sm font-medium ${getConfidenceColor(prediction.confidence_score)}`}
            >
              {Math.round(prediction.confidence_score * 100)}%
            </span>
          </div>
        </div>

        {/* Prediction Results */}
        <div className="space-y-4">
          {prediction.prediction_type === "market_forecast" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Growth Rate</p>
                <div className="flex items-center gap-2 mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-gray-900">
                    +{predictionData.growth_percentage}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Market Value</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(predictionData.estimated_value / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          )}

          {prediction.prediction_type === "price_trend" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Price Direction</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(predictionData.price_direction) &&
                    React.createElement(
                      getTrendIcon(predictionData.price_direction),
                      {
                        className: `w-4 h-4 ${
                          predictionData.price_direction
                            ?.toLowerCase()
                            .includes("increase")
                            ? "text-green-600"
                            : predictionData.price_direction
                                  ?.toLowerCase()
                                  .includes("decrease")
                              ? "text-red-600"
                              : "text-gray-600"
                        }`,
                      },
                    )}
                  <span className="text-lg font-bold text-gray-900 capitalize">
                    {predictionData.price_direction}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Change Expected</p>
                <p className="text-lg font-bold text-gray-900">
                  {predictionData.percentage_change > 0 ? "+" : ""}
                  {predictionData.percentage_change}%
                </p>
              </div>
            </div>
          )}

          {prediction.prediction_type === "demand_prediction" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Demand Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(predictionData.demand_direction) &&
                    React.createElement(
                      getTrendIcon(predictionData.demand_direction),
                      {
                        className: `w-4 h-4 ${
                          predictionData.demand_direction
                            ?.toLowerCase()
                            .includes("increase")
                            ? "text-green-600"
                            : predictionData.demand_direction
                                  ?.toLowerCase()
                                  .includes("decrease")
                              ? "text-red-600"
                              : "text-gray-600"
                        }`,
                      },
                    )}
                  <span className="text-lg font-bold text-gray-900 capitalize">
                    {predictionData.demand_direction}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Volume Change</p>
                <p className="text-lg font-bold text-gray-900">
                  {predictionData.volume_change_percentage > 0 ? "+" : ""}
                  {predictionData.volume_change_percentage}%
                </p>
              </div>
            </div>
          )}

          {/* Key Insights */}
          {prediction.key_insights && prediction.key_insights.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Key Insights
              </h5>
              <ul className="space-y-1">
                {prediction.key_insights.slice(0, 3).map((insight, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <ChevronRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated timestamp */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Generated: {new Date(prediction.created_at).toLocaleDateString()}
            </div>
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {periods.find((p) => p.id === prediction.period)?.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!company) {
    return (
      <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">AI Predictions</h3>
        <p className="text-gray-600">
          Complete company setup to access AI-powered market predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Market Predictions
            </h2>
            <p className="text-gray-600">
              Advanced AI-powered forecasting for strategic decision making
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                Market Intelligence
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Forecast market trends and opportunities
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">
                Predictive Analytics
              </span>
            </div>
            <p className="text-sm text-gray-600">
              AI-driven price and demand forecasting
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Smart Insights</span>
            </div>
            <p className="text-sm text-gray-600">
              Actionable recommendations for growth
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Generate New Prediction
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Prediction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prediction Type
            </label>
            <div className="space-y-2">
              {predictionTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPredictionType(type.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                      selectedPredictionType === type.id
                        ? `${colorClasses[type.color]} border-2`
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <TypeIcon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forecast Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`p-3 rounded-lg border transition ${
                    selectedPeriod === period.id
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{period.name}</p>
                  <p className="text-sm text-gray-600">{period.duration}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePrediction}
          disabled={isGenerating}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating AI Prediction...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Prediction
            </>
          )}
        </button>
      </div>

      {/* Predictions Results */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading predictions...</p>
        </div>
      ) : predictionsData?.predictions?.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Predictions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictionsData.predictions.map(renderPredictionCard)}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Predictions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate your first AI-powered market prediction to get started.
          </p>
          <button
            onClick={handleGeneratePrediction}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate First Prediction
          </button>
        </div>
      )}
    </div>
  );
}
