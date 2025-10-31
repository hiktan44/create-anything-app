import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Search,
  TrendingUp,
  Users,
  MapPin,
  Bot,
  Plus,
  Filter,
} from "lucide-react";

export default function MarketsTab({ company }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: targetMarkets, isLoading } = useQuery({
    queryKey: ["target-markets", company?.id],
    queryFn: async () => {
      const res = await fetch(`/api/target-markets?company_id=${company.id}`);
      if (!res.ok) throw new Error("Failed to fetch target markets");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const analyzeMarketMutation = useMutation({
    mutationFn: async (query) => {
      setIsAnalyzing(true);
      setAnalysisResults(null);

      // Use ChatGPT to analyze market potential
      const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert international trade analyst. Provide detailed market analysis for export opportunities.",
            },
            {
              role: "user",
              content: `Analyze the market potential for "${query}" in different countries. Include market size, growth trends, competition level, and top 5 target countries with import volumes and growth rates.`,
            },
          ],
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to analyze market");
      const aiData = await aiRes.json();

      return aiData.choices[0].message.content;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    },
  });

  const discoverMarketsMutation = useMutation({
    mutationFn: async ({ product, country }) => {
      // Use AI to generate market insights
      const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a trade data analyst. Generate realistic market data for export analysis.",
            },
            {
              role: "user",
              content: `Generate market analysis data for "${product}" in "${country}". Include import volume (in thousands USD), average price, growth rate (%), and competition level (Low/Medium/High).`,
            },
          ],
          json_schema: {
            name: "market_analysis",
            schema: {
              type: "object",
              properties: {
                country: { type: "string" },
                market_potential: { type: "string" },
                import_volume: { type: "number" },
                average_price: { type: "number" },
                growth_rate: { type: "number" },
                competition_level: { type: "string" },
              },
              required: [
                "country",
                "market_potential",
                "import_volume",
                "average_price",
                "growth_rate",
                "competition_level",
              ],
              additionalProperties: false,
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate market data");
      const aiData = await aiRes.json();
      const marketData = JSON.parse(aiData.choices[0].message.content);

      // Save to database
      const saveRes = await fetch("/api/target-markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...marketData,
          product_id: 1, // This would be dynamic based on selected product
          company_id: company.id,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save market data");
      return saveRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["target-markets"]);
      setShowSearchModal(false);
    },
  });

  const handleMarketSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = formData.get("product");
    const country = formData.get("country");

    discoverMarketsMutation.mutate({ product, country });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Market Analysis Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">AI Market Intelligence</h3>
            <p className="text-blue-100">
              Get instant market analysis powered by AI
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter product or market to analyze..."
            className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={() => analyzeMarketMutation.mutate(searchQuery)}
            disabled={!searchQuery || isAnalyzing}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {/* AI Analysis Results */}
      {analysisResults && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Market Analysis Results
          </h3>
          <div className="prose prose-gray max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {analysisResults}
            </pre>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          Discover Market
        </button>
      </div>

      {/* Markets Grid */}
      {targetMarkets?.markets?.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Markets Discovered Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Use AI to discover potential export markets for your products.
          </p>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Discover Markets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targetMarkets?.markets?.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {market.country}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {market.market_potential}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    market.competition_level === "Low"
                      ? "bg-green-100 text-green-800"
                      : market.competition_level === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {market.competition_level} Competition
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Import Volume</span>
                  <span className="font-semibold">
                    ${market.import_volume?.toLocaleString()}K
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Price</span>
                  <span className="font-semibold">${market.average_price}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growth Rate</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      className={`w-4 h-4 ${market.growth_rate > 0 ? "text-green-600" : "text-red-600"}`}
                    />
                    <span
                      className={`font-semibold ${market.growth_rate > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {market.growth_rate}%
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Market Discovery Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Discover New Market
              </h3>
            </div>

            <form onSubmit={handleMarketSearch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <input
                  type="text"
                  name="product"
                  placeholder="e.g., Electronics, Textiles, Food Products"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Country
                </label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g., Germany, United States, Japan"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={discoverMarketsMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {discoverMarketsMutation.isPending
                    ? "Discovering..."
                    : "Discover Market"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
