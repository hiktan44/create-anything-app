import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Shield,
  Search,
  Download,
  Filter,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function CustomDutiesTab({ company, filters }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const generateCustomDutiesMutation = useMutation({
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
                "You are a customs and trade regulation expert. Generate detailed custom duties and tariff information.",
            },
            {
              role: "user",
              content: `Generate custom duties information for HS Code ${filters.hsCode} when exporting from ${filters.exporterCountry || "Turkey"} to ${filters.targetCountry}. Include tariff rates, additional fees, and regulatory requirements.`,
            },
          ],
          json_schema: {
            name: "custom_duties",
            schema: {
              type: "object",
              properties: {
                duties: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      country: { type: "string" },
                      hsCode: { type: "string" },
                      description: { type: "string" },
                      dutyRate: { type: "number" },
                      additionalFees: { type: "string" },
                      vatRate: { type: "number" },
                      preferentialRate: { type: "number" },
                      quota: { type: "string" },
                      restrictions: { type: "string" },
                      documents: { type: "string" },
                      lastUpdated: { type: "string" },
                    },
                  },
                },
                summary: {
                  type: "object",
                  properties: {
                    totalCost: { type: "number" },
                    averageDuty: { type: "number" },
                    complexity: { type: "string" },
                  },
                },
              },
              required: ["duties", "summary"],
            },
          },
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate custom duties data");
      const result = await aiRes.json();
      return JSON.parse(result.choices[0].message.content);
    },
  });

  useEffect(() => {
    if (filters.hsCode && filters.targetCountry) {
      generateCustomDutiesMutation.mutate();
    }
  }, [filters.hsCode, filters.targetCountry, filters.exporterCountry]);

  const columns = [
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
      accessorKey: "hsCode",
      header: "HS Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("hsCode")}</span>
      ),
    },
    {
      accessorKey: "dutyRate",
      header: "Duty Rate",
      cell: ({ row }) => (
        <span className="font-semibold text-red-600">
          {row.getValue("dutyRate")}%
        </span>
      ),
    },
    {
      accessorKey: "vatRate",
      header: "VAT Rate",
      cell: ({ row }) => (
        <span className="text-blue-600">{row.getValue("vatRate")}%</span>
      ),
    },
    {
      accessorKey: "preferentialRate",
      header: "Preferential Rate",
      cell: ({ row }) => {
        const rate = row.getValue("preferentialRate");
        return rate ? (
          <span className="text-green-600 font-medium">{rate}%</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "restrictions",
      header: "Restrictions",
      cell: ({ row }) => {
        const restrictions = row.getValue("restrictions");
        const hasRestrictions = restrictions && restrictions !== "None";
        return (
          <div className="flex items-center gap-1">
            {hasRestrictions ? (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600 text-xs">Yes</span>
              </>
            ) : (
              <span className="text-green-600 text-xs">None</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedDuty(row.original);
            setShowModal(true);
          }}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <Info className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];

  const filteredData =
    generateCustomDutiesMutation.data?.duties?.filter(
      (duty) =>
        duty.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        duty.hsCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        duty.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const dutiesData = generateCustomDutiesMutation.data;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Custom Duties & Tariffs
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search duties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">Filter</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {dutiesData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Duty Rate
              </h3>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {dutiesData.summary.averageDuty?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              standard rate
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Import Cost
              </h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dutiesData.summary.totalCost?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              of product value
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Complexity
              </h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {dutiesData.summary.complexity}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              regulatory level
            </p>
          </div>
        </div>
      )}

      {/* Duties Table */}
      {dutiesData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Tariff Information ({filteredData.length} entries)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
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
      )}

      {/* Duty Detail Modal */}
      {showModal && selectedDuty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDuty.country} - {selectedDuty.hsCode}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Tariff Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Product Description:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedDuty.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      HS Code:
                    </span>
                    <p className="font-mono text-gray-900 dark:text-gray-100">
                      {selectedDuty.hsCode}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Standard Duty Rate:
                    </span>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      {selectedDuty.dutyRate}%
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      VAT Rate:
                    </span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {selectedDuty.vatRate}%
                    </p>
                  </div>
                  {selectedDuty.preferentialRate && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Preferential Rate:
                      </span>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {selectedDuty.preferentialRate}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Fees */}
              {selectedDuty.additionalFees && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Additional Fees
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedDuty.additionalFees}
                  </p>
                </div>
              )}

              {/* Quotas */}
              {selectedDuty.quota && selectedDuty.quota !== "None" && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Quota Information
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    {selectedDuty.quota}
                  </p>
                </div>
              )}

              {/* Restrictions */}
              {selectedDuty.restrictions &&
                selectedDuty.restrictions !== "None" && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Restrictions & Requirements
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      {selectedDuty.restrictions}
                    </p>
                  </div>
                )}

              {/* Required Documents */}
              {selectedDuty.documents && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Required Documents
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    {selectedDuty.documents}
                  </p>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                Last updated: {selectedDuty.lastUpdated}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {generateCustomDutiesMutation.isPending && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Tariff Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching custom duties and regulatory requirements...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!dutiesData && !generateCustomDutiesMutation.isPending && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Custom Duties & Tariffs
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select HS Code and Target Country to view tariff rates, customs
            duties, and regulatory requirements.
          </p>
        </div>
      )}

      {/* Error State */}
      {generateCustomDutiesMutation.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">
            Error: {generateCustomDutiesMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
