import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Package, Search, Download, BarChart3, PieChart } from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function ProductAnalysisTab({ company, filters }) {
  const [searchTerm, setSearchTerm] = useState("");

  const generateProductAnalysisMutation = useMutation({
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
                "Generate comprehensive product analysis data for trade intelligence.",
            },
            {
              role: "user",
              content: `Generate product analysis for HS Code ${filters.hsCode} in ${filters.targetCountry}. Include product variants, market statistics, and competitive analysis.`,
            },
          ],
          json_schema: {
            name: "product_analysis",
            schema: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      productName: { type: "string" },
                      hsCode: { type: "string" },
                      salesVolume: { type: "number" },
                      totalValue: { type: "number" },
                      averagePrice: { type: "number" },
                      marketShare: { type: "number" },
                      growthRate: { type: "number" },
                    },
                  },
                },
                distribution: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      value: { type: "number" },
                      percentage: { type: "number" },
                    },
                  },
                },
              },
              required: ["products", "distribution"],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate product analysis");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  useEffect(() => {
    if (filters.hsCode && filters.targetCountry) {
      generateProductAnalysisMutation.mutate();
    }
  }, [filters.hsCode, filters.targetCountry]);

  const columns = [
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue("productName")}
        </div>
      ),
    },
    {
      accessorKey: "hsCode",
      header: "HS Code",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.getValue("hsCode")}</span>
      ),
    },
    {
      accessorKey: "salesVolume",
      header: "Sales Volume",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.getValue("salesVolume")?.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Total Value",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          ${row.getValue("totalValue")?.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "averagePrice",
      header: "Avg Price",
      cell: ({ row }) => (
        <span>${row.getValue("averagePrice")?.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "marketShare",
      header: "Market Share",
      cell: ({ row }) => (
        <span className="text-blue-600 font-medium">
          {row.getValue("marketShare")}%
        </span>
      ),
    },
    {
      accessorKey: "growthRate",
      header: "Growth Rate",
      cell: ({ row }) => {
        const rate = row.getValue("growthRate");
        return (
          <span
            className={`font-medium ${rate > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {rate > 0 ? "+" : ""}
            {rate}%
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: generateProductAnalysisMutation.data?.products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Product Analysis
            </h3>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {generateProductAnalysisMutation.data && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Distribution Pie Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Distribution
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={generateProductAnalysisMutation.data.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${category}: ${percentage}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generateProductAnalysisMutation.data.distribution.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Bar Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Products by Value
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={generateProductAnalysisMutation.data.products?.slice(
                    0,
                    5,
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalValue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed Product Analysis
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {generateProductAnalysisMutation.isPending && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analyzing Products
          </h3>
          <p className="text-gray-600">
            Generating comprehensive product analysis...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!generateProductAnalysisMutation.data &&
        !generateProductAnalysisMutation.isPending && (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Product Analysis
            </h3>
            <p className="text-gray-600 mb-6">
              Select HS Code and Target Country to analyze product distribution,
              market statistics, and performance metrics.
            </p>
          </div>
        )}

      {/* Error State */}
      {generateProductAnalysisMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error: {generateProductAnalysisMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
