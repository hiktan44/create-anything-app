import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Search,
  Download,
  Filter,
  TrendingUp,
  Package,
  Target,
  BarChart3,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Papa from "papaparse";

export default function TargetMarketSelectionTab({
  company,
  filters,
  setFilters,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [gtipData, setGtipData] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const queryClient = useQueryClient();

  // Fetch GTIP codes
  const { data: gtipCodesData } = useQuery({
    queryKey: ["gtip-codes"],
    queryFn: async () => {
      const res = await fetch("/api/gtip-codes");
      if (!res.ok) throw new Error("Failed to fetch GTIP codes");
      return res.json();
    },
  });

  // Update GTIP data when fetched
  useEffect(() => {
    if (gtipCodesData?.gtipCodes) {
      setGtipData(gtipCodesData.gtipCodes);
    }
  }, [gtipCodesData]);

  // Handle main category selection
  const handleMainCategoryChange = (categoryCode) => {
    setFilters((prev) => ({
      ...prev,
      selectedMainCategory: categoryCode,
      selectedSubCategory: "",
      selectedProduct: "",
      hsCode: "",
    }));

    if (categoryCode && gtipData?.[categoryCode]) {
      setAvailableSubCategories(
        Object.entries(gtipData[categoryCode].subcategories),
      );
      setAvailableProducts([]);
    } else {
      setAvailableSubCategories([]);
      setAvailableProducts([]);
    }
  };

  // Handle sub category selection
  const handleSubCategoryChange = (subCategoryCode) => {
    setFilters((prev) => ({
      ...prev,
      selectedSubCategory: subCategoryCode,
      selectedProduct: "",
      hsCode: "",
    }));

    if (
      subCategoryCode &&
      gtipData?.[filters.selectedMainCategory]?.subcategories?.[subCategoryCode]
    ) {
      const products =
        gtipData[filters.selectedMainCategory].subcategories[subCategoryCode]
          .products;
      setAvailableProducts(products);
    } else {
      setAvailableProducts([]);
    }
  };

  // Handle product selection
  const handleProductChange = (productCode) => {
    setFilters((prev) => ({
      ...prev,
      selectedProduct: productCode,
      hsCode: productCode,
    }));
  };

  // Fetch market data using AI
  const generateMarketDataMutation = useMutation({
    mutationFn: async () => {
      if (!filters.hsCode || !filters.targetCountry) {
        throw new Error("HS Code and Target Country are required");
      }

      // Generate comprehensive market data using AI
      const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a trade data expert. Generate realistic import/export data for market analysis.",
            },
            {
              role: "user",
              content: `Generate detailed trade data for HS Code ${filters.hsCode} in ${filters.targetCountry} for ${filters.year}. Include world yearly import/export data, country comparisons, and market changes.`,
            },
          ],
          json_schema: {
            name: "trade_data",
            schema: {
              type: "object",
              properties: {
                worldImports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      totalImports: { type: "number" },
                      quantity: { type: "number" },
                      averagePrice: { type: "number" },
                      year: { type: "number" },
                      growthRate: { type: "number" },
                    },
                  },
                },
                worldExports: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      totalExports: { type: "number" },
                      quantity: { type: "number" },
                      averagePrice: { type: "number" },
                      year: { type: "number" },
                      growthRate: { type: "number" },
                    },
                  },
                },
                targetCountryData: {
                  type: "object",
                  properties: {
                    imports: { type: "number" },
                    exports: { type: "number" },
                    marketShare: { type: "number" },
                    competitionLevel: { type: "string" },
                  },
                },
              },
              required: ["worldImports", "worldExports", "targetCountryData"],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate market data");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  // Table columns for world imports
  const importColumns = [
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-gray-300 rounded"></div>
          <span className="font-medium">{row.getValue("country")}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalImports",
      header: "Total Imports ($)",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          ${row.getValue("totalImports")?.toLocaleString()}M
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity (kg)",
      cell: ({ row }) => (
        <span>{row.getValue("quantity")?.toLocaleString()} kg</span>
      ),
    },
    {
      accessorKey: "averagePrice",
      header: "Avg Price ($/kg)",
      cell: ({ row }) => (
        <span>${row.getValue("averagePrice")?.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "growthRate",
      header: "Growth Rate",
      cell: ({ row }) => {
        const rate = row.getValue("growthRate");
        return (
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`w-4 h-4 ${rate > 0 ? "text-green-600" : "text-red-600"}`}
            />
            <span
              className={`font-medium ${rate > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {rate > 0 ? "+" : ""}
              {rate}%
            </span>
          </div>
        );
      },
    },
  ];

  // Export columns for world exports
  const exportColumns = [
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-gray-300 rounded"></div>
          <span className="font-medium">{row.getValue("country")}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalExports",
      header: "Total Exports ($)",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          ${row.getValue("totalExports")?.toLocaleString()}M
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity (kg)",
      cell: ({ row }) => (
        <span>{row.getValue("quantity")?.toLocaleString()} kg</span>
      ),
    },
    {
      accessorKey: "averagePrice",
      header: "Avg Price ($/kg)",
      cell: ({ row }) => (
        <span>${row.getValue("averagePrice")?.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "growthRate",
      header: "Growth Rate",
      cell: ({ row }) => {
        const rate = row.getValue("growthRate");
        return (
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`w-4 h-4 ${rate > 0 ? "text-green-600" : "text-red-600"}`}
            />
            <span
              className={`font-medium ${rate > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {rate > 0 ? "+" : ""}
              {rate}%
            </span>
          </div>
        );
      },
    },
  ];

  const importTable = useReactTable({
    data: generateMarketDataMutation.data?.worldImports || [],
    columns: importColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const exportTable = useReactTable({
    data: generateMarketDataMutation.data?.worldExports || [],
    columns: exportColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Export data as CSV
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyzeMarket = () => {
    if (!filters.hsCode || !filters.targetCountry) {
      alert("Please select HS Code and Target Country first");
      return;
    }
    generateMarketDataMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Market Selection Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Main Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ana Kategori *
            </label>
            <select
              value={filters.selectedMainCategory || ""}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Ana Kategori Seçin</option>
              {gtipData &&
                Object.entries(gtipData).map(([code, category]) => (
                  <option key={code} value={code}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Sub Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Kategori *
            </label>
            <select
              value={filters.selectedSubCategory || ""}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
              disabled={!filters.selectedMainCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Alt Kategori Seçin</option>
              {availableSubCategories.map(([code, subCategory]) => (
                <option key={code} value={code}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GTIP Kodu *
            </label>
            <select
              value={filters.selectedProduct || ""}
              onChange={(e) => handleProductChange(e.target.value)}
              disabled={!filters.selectedSubCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">GTIP Kodu Seçin</option>
              {availableProducts.map((productCode) => (
                <option key={productCode} value={productCode}>
                  {productCode}
                </option>
              ))}
            </select>
          </div>

          {/* Target Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hedef Ülke *
            </label>
            <select
              value={filters.targetCountry}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  targetCountry: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Hedef Ülke Seçin</option>
              <option value="US">ABD</option>
              <option value="DE">Almanya</option>
              <option value="UK">İngiltere</option>
              <option value="FR">Fransa</option>
              <option value="IT">İtalya</option>
              <option value="ES">İspanya</option>
              <option value="NL">Hollanda</option>
              <option value="JP">Japonya</option>
              <option value="CN">Çin</option>
              <option value="RU">Rusya</option>
              <option value="CA">Kanada</option>
              <option value="AU">Avustralya</option>
              <option value="BR">Brezilya</option>
              <option value="IN">Hindistan</option>
              <option value="KR">Güney Kore</option>
              <option value="MX">Meksika</option>
              <option value="SA">Suudi Arabistan</option>
              <option value="AE">BAE</option>
              <option value="EG">Mısır</option>
              <option value="ZA">Güney Afrika</option>
            </select>
          </div>

          {/* Exporter Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İhracatçı Ülke
            </label>
            <select
              value={filters.exporterCountry}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  exporterCountry: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TR">Türkiye</option>
              <option value="CN">Çin</option>
              <option value="DE">Almanya</option>
              <option value="US">ABD</option>
              <option value="IT">İtalya</option>
              <option value="FR">Fransa</option>
              <option value="UK">İngiltere</option>
              <option value="ES">İspanya</option>
              <option value="NL">Hollanda</option>
            </select>
          </div>

          {/* Analyze Button */}
          <div className="flex items-end">
            <button
              onClick={handleAnalyzeMarket}
              disabled={
                generateMarketDataMutation.isPending ||
                !filters.hsCode ||
                !filters.targetCountry
              }
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {generateMarketDataMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              Pazar Analiz Et
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {generateMarketDataMutation.data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Market Potential
                </h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                $
                {generateMarketDataMutation.data.targetCountryData.imports?.toLocaleString()}
                M
              </p>
              <p className="text-sm text-gray-600">Total Imports</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Market Share</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {generateMarketDataMutation.data.targetCountryData.marketShare}%
              </p>
              <p className="text-sm text-gray-600">Current Position</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Competition</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {
                  generateMarketDataMutation.data.targetCountryData
                    .competitionLevel
                }
              </p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
          </div>

          {/* World Imports Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  World Yearly Imports
                </h3>
                <button
                  onClick={() =>
                    exportToCSV(
                      generateMarketDataMutation.data.worldImports,
                      "world-imports.csv",
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {importTable.getHeaderGroups().map((headerGroup) => (
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
                  {importTable.getRowModel().rows.map((row) => (
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

          {/* World Exports Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  World Yearly Exports
                </h3>
                <button
                  onClick={() =>
                    exportToCSV(
                      generateMarketDataMutation.data.worldExports,
                      "world-exports.csv",
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {exportTable.getHeaderGroups().map((headerGroup) => (
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
                  {exportTable.getRowModel().rows.map((row) => (
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

      {/* Empty State */}
      {!generateMarketDataMutation.data &&
        !generateMarketDataMutation.isPending && (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select Your Target Market
            </h3>
            <p className="text-gray-600 mb-6">
              Enter HS Code and Target Country to analyze import/export
              opportunities and market potential.
            </p>
          </div>
        )}

      {/* Error State */}
      {generateMarketDataMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error: {generateMarketDataMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
