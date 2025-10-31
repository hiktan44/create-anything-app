import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Globe,
  Users,
} from "lucide-react";

export default function ReportsTab({ company }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: marketReports, isLoading } = useQuery({
    queryKey: ["market-reports", company?.id],
    queryFn: async () => {
      const res = await fetch(`/api/market-reports?company_id=${company.id}`);
      if (!res.ok) throw new Error("Failed to fetch market reports");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData) => {
      setIsGenerating(true);

      // Use ChatGPT to generate comprehensive market report
      const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert international trade analyst. Generate comprehensive market reports with data, insights, and actionable recommendations.",
            },
            {
              role: "user",
              content: `Generate a detailed market report for "${reportData.product_category}" in "${reportData.country}". Include market size, import/export trends, key competitors, pricing analysis, regulatory considerations, and strategic recommendations for exporters.`,
            },
          ],
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate report");
      const aiData = await aiRes.json();
      const reportContent = aiData.choices[0].message.content;

      // Generate realistic market data using AI
      const dataRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Generate realistic trade data for market reports.",
            },
            {
              role: "user",
              content: `Generate market data for "${reportData.product_category}" in "${reportData.country}": total imports (USD millions), total exports (USD millions), average unit price (USD), trend direction (Growing/Stable/Declining), top 3 competitors.`,
            },
          ],
          json_schema: {
            name: "market_data",
            schema: {
              type: "object",
              properties: {
                total_imports: { type: "number" },
                total_exports: { type: "number" },
                average_unit_price: { type: "number" },
                trend_direction: { type: "string" },
                key_competitors: { type: "string" },
              },
              required: [
                "total_imports",
                "total_exports",
                "average_unit_price",
                "trend_direction",
                "key_competitors",
              ],
              additionalProperties: false,
            },
          },
        }),
      });

      const marketData = JSON.parse(
        (await dataRes.json()).choices[0].message.content,
      );

      // Save report to database
      const saveRes = await fetch("/api/market-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          report_title: `${reportData.product_category} Market Analysis - ${reportData.country}`,
          report_type: reportData.report_type,
          country: reportData.country,
          product_category: reportData.product_category,
          total_imports: marketData.total_imports,
          total_exports: marketData.total_exports,
          average_unit_price: marketData.average_unit_price,
          trend_direction: marketData.trend_direction,
          key_competitors: marketData.key_competitors,
          recommendations: reportContent,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save report");

      setIsGenerating(false);
      return { reportContent, reportData: await saveRes.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["market-reports"]);
      setShowCreateModal(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async (report) => {
      // Generate PDF using the report content
      const pdfRes = await fetch("/integrations/pdf-generation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: {
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>${report.report_title}</title>
              </head>
              <body>
                <h1>${report.report_title}</h1>
                <h2>Executive Summary</h2>
                <p><strong>Country:</strong> ${report.country}</p>
                <p><strong>Product Category:</strong> ${report.product_category}</p>
                <p><strong>Report Type:</strong> ${report.report_type}</p>
                <p><strong>Generated:</strong> ${new Date(report.created_at).toLocaleDateString()}</p>
                
                <h2>Market Data</h2>
                <ul>
                  <li><strong>Total Imports:</strong> $${report.total_imports?.toLocaleString()} million</li>
                  <li><strong>Total Exports:</strong> $${report.total_exports?.toLocaleString()} million</li>
                  <li><strong>Average Unit Price:</strong> $${report.average_unit_price}</li>
                  <li><strong>Market Trend:</strong> ${report.trend_direction}</li>
                </ul>
                
                <h2>Key Competitors</h2>
                <p>${report.key_competitors}</p>
                
                <h2>Analysis & Recommendations</h2>
                <div style="white-space: pre-wrap;">${report.recommendations}</div>
              </body>
              </html>
            `,
          },
        }),
      });

      if (!pdfRes.ok) throw new Error("Failed to generate PDF");

      const pdfBlob = await pdfRes.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.report_title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const handleCreateReport = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reportData = {
      product_category: formData.get("product_category"),
      country: formData.get("country"),
      report_type: formData.get("report_type"),
    };

    generateReportMutation.mutate(reportData);
  };

  const filteredReports =
    marketReports?.reports?.filter(
      (report) =>
        report.report_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.product_category
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reports Generated Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate AI-powered market reports to analyze opportunities and make
            informed decisions.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {report.report_title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {report.report_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{report.country}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Product Category:</span>
                  <span className="font-medium">{report.product_category}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Market Trend:</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        report.trend_direction === "Growing"
                          ? "text-green-600"
                          : report.trend_direction === "Declining"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        report.trend_direction === "Growing"
                          ? "text-green-600"
                          : report.trend_direction === "Declining"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {report.trend_direction}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Import Volume:</span>
                  <span className="font-medium">
                    ${report.total_imports?.toLocaleString()}M
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Avg. Price:</span>
                  <span className="font-medium">
                    ${report.average_unit_price}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                  View Details
                </button>
                <button
                  onClick={() => downloadReportMutation.mutate(report)}
                  disabled={downloadReportMutation.isPending}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Generated {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Generate Market Report
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered analysis of market opportunities
              </p>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <input
                  type="text"
                  name="product_category"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  name="report_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Market Analysis">Market Analysis</option>
                  <option value="Competitive Analysis">
                    Competitive Analysis
                  </option>
                  <option value="Export Opportunity">Export Opportunity</option>
                  <option value="Regulatory Overview">
                    Regulatory Overview
                  </option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Report generation typically takes 30-60
                  seconds. The AI will analyze market conditions, competitors,
                  and opportunities.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
