import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Package,
  Globe,
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Star,
  ChevronRight,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sparkles,
  Award,
  Filter,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function SmartProductMatchingTab({ company, filters }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(0.6);
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ["products", company?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?company_id=${company.id}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const { data: matchesData, isLoading } = useQuery({
    queryKey: [
      "product-matches",
      company?.id,
      selectedProduct?.id,
      minMatchScore,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        company_id: company.id,
        min_score: minMatchScore,
      });
      if (selectedProduct) {
        params.append("product_id", selectedProduct.id);
      }
      const res = await fetch(`/api/product-matching?${params}`);
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async (matchData) => {
      const res = await fetch("/api/product-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });
      if (!res.ok) throw new Error("Failed to generate matches");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product-matches"]);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error("Match generation failed:", error);
      setIsAnalyzing(false);
    },
  });

  const handleGenerateMatches = async () => {
    if (!selectedProduct) return;

    setIsAnalyzing(true);

    const matchData = {
      company_id: company.id,
      product_id: selectedProduct.id,
      target_markets: selectedMarkets,
    };

    generateMatchesMutation.mutate(matchData);
  };

  const availableMarkets = [
    "United States",
    "Germany",
    "United Kingdom",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Japan",
    "China",
    "Canada",
    "Australia",
    "Brazil",
    "India",
    "South Korea",
    "Mexico",
  ];

  const getScoreColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score) => {
    if (score >= 0.8) return CheckCircle;
    if (score >= 0.6) return AlertTriangle;
    return AlertTriangle;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderMatchCard = (match) => {
    const ScoreIcon = getScoreIcon(match.match_score);

    return (
      <div
        key={`${match.product_id}-${match.target_market}`}
        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {match.target_market}
              </h4>
              <p className="text-sm text-gray-600">{match.product_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScoreIcon
              className={`w-5 h-5 ${getScoreColor(match.match_score).split(" ")[0]}`}
            />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.match_score)}`}
            >
              {Math.round(match.match_score * 100)}%
            </span>
          </div>
        </div>

        {/* Market Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Market Size</span>
            </div>
            <span className="font-semibold text-gray-900 capitalize">
              {match.market_size}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Competition</span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(match.competition_level)}`}
            >
              {match.competition_level}
            </span>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Growth</div>
            <div
              className={`text-sm font-medium capitalize ${getLevelColor(match.growth_potential)}`}
            >
              {match.growth_potential}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Barriers</div>
            <div
              className={`text-sm font-medium capitalize ${getLevelColor(match.entry_barriers)}`}
            >
              {match.entry_barriers}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Cultural Fit</div>
            <div className="text-sm font-medium text-gray-900">
              {Math.round(match.cultural_fit * 100)}%
            </div>
          </div>
        </div>

        {/* Key Advantages */}
        {match.key_advantages && match.key_advantages.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              Key Advantages
            </h5>
            <ul className="space-y-1">
              {match.key_advantages.slice(0, 3).map((advantage, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <ChevronRight className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {match.risk_factors && match.risk_factors.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Risk Factors
            </h5>
            <ul className="space-y-1">
              {match.risk_factors.slice(0, 2).map((risk, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <ChevronRight className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Generated timestamp */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Analysis: {new Date(match.created_at).toLocaleDateString()}
        </div>
      </div>
    );
  };

  if (!company) {
    return (
      <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Smart Product Matching
        </h3>
        <p className="text-gray-600">
          Complete company setup to access AI-powered product-market matching.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Smart Product Matching
            </h2>
            <p className="text-gray-600">
              AI-powered product-market compatibility analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">AI Matching</span>
            </div>
            <p className="text-sm text-gray-600">
              Advanced algorithms for optimal market selection
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Market Analysis</span>
            </div>
            <p className="text-sm text-gray-600">
              Comprehensive market size and competition insights
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Smart Scoring</span>
            </div>
            <p className="text-sm text-gray-600">
              Detailed compatibility and risk assessment
            </p>
          </div>
        </div>
      </div>

      {/* Product Selection & Analysis */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product-Market Analysis
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Product
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {productsData?.products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                    selectedProduct?.id === product.id
                      ? "bg-purple-50 border-purple-300 text-purple-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {product.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.category} • HS: {product.hs_code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Markets Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Markets (Optional)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {availableMarkets.map((market) => (
                  <label
                    key={market}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMarkets([...selectedMarkets, market]);
                        } else {
                          setSelectedMarkets(
                            selectedMarkets.filter((m) => m !== market),
                          );
                        }
                      }}
                      className="rounded text-purple-600"
                    />
                    <span className="truncate">{market}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to analyze all major markets
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Min Score:</span>
              <select
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value={0.3}>30%+</option>
                <option value={0.5}>50%+</option>
                <option value={0.6}>60%+</option>
                <option value={0.7}>70%+</option>
                <option value={0.8}>80%+</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateMatches}
            disabled={!selectedProduct || isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing Markets...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Matches
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      ) : matchesData?.matches?.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Market Matches
            </h3>
            <span className="text-sm text-gray-600">
              {matchesData.matches.length} matches found
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matchesData.matches.map(renderMatchCard)}
          </div>
        </div>
      ) : selectedProduct ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Matches Found
          </h3>
          <p className="text-gray-600 mb-6">
            No market matches found for "{selectedProduct.product_name}" with
            the current criteria.
          </p>
          <button
            onClick={handleGenerateMatches}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate New Analysis
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Select a Product
          </h3>
          <p className="text-gray-600">
            Choose a product to analyze its market compatibility and find the
            best target markets.
          </p>
        </div>
      )}
    </div>
  );
}
