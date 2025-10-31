import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  MapPin,
  Building2,
  Mail,
  Phone,
  Plus,
  Filter,
  Star,
} from "lucide-react";

export default function BuyersTab({ company }) {
  const [searchLocation, setSearchLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: potentialBuyers, isLoading } = useQuery({
    queryKey: ["potential-buyers", company?.id],
    queryFn: async () => {
      const res = await fetch(`/api/potential-buyers?company_id=${company.id}`);
      if (!res.ok) throw new Error("Failed to fetch potential buyers");
      return res.json();
    },
    enabled: !!company?.id,
  });

  const searchBuyersMutation = useMutation({
    mutationFn: async ({ query, location }) => {
      setIsSearching(true);

      // Use Local Business Data integration to find real businesses
      const businessRes = await fetch(
        `/integrations/local-business-data/search?query=${encodeURIComponent(query)}&limit=20&region=us&verified=true`,
        {
          method: "GET",
        },
      );

      if (!businessRes.ok) throw new Error("Failed to search businesses");
      const businessData = await businessRes.json();

      // Process and save relevant businesses as potential buyers
      const buyers = [];
      for (const business of businessData.data.slice(0, 5)) {
        const buyerData = {
          buyer_name: business.name,
          buyer_country: business.country || "US",
          industry_segment: business.type || "General",
          company_size: "Unknown",
          match_score: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
          contact_email: null,
          contact_phone: business.phone_number,
          website: business.website,
          notes: business.about?.summary || "",
          company_id: company.id,
        };

        const saveRes = await fetch("/api/potential-buyers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buyerData),
        });

        if (saveRes.ok) {
          const savedBuyer = await saveRes.json();
          buyers.push(savedBuyer);
        }
      }

      setIsSearching(false);
      return buyers;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["potential-buyers"]);
      setShowSearchModal(false);
    },
    onError: () => {
      setIsSearching(false);
    },
  });

  const handleBuyerSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("query");
    const location = formData.get("location");

    searchBuyersMutation.mutate({ query, location });
  };

  const filteredBuyers =
    potentialBuyers?.buyers?.filter(
      (buyer) =>
        buyer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.buyer_country
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        buyer.industry_segment
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
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
              placeholder="Search buyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          Find Buyers
        </button>
      </div>

      {/* Buyers Grid */}
      {filteredBuyers.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Potential Buyers Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Search for businesses that might be interested in your products.
          </p>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Find Buyers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {buyer.buyer_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {buyer.industry_segment}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {(buyer.match_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{buyer.buyer_country}</span>
                </div>

                {buyer.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{buyer.contact_phone}</span>
                  </div>
                )}

                {buyer.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{buyer.contact_email}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Company Size:</span>
                  <span className="font-medium">{buyer.company_size}</span>
                </div>

                {buyer.import_frequency && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Import Frequency:</span>
                    <span className="font-medium">
                      {buyer.import_frequency}
                    </span>
                  </div>
                )}
              </div>

              {buyer.notes && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {buyer.notes}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                  Contact
                </button>
                {buyer.website && (
                  <button
                    onClick={() => window.open(buyer.website, "_blank")}
                    className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm"
                  >
                    Visit Website
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buyer Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Find Potential Buyers
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Search for businesses that might be interested in your products
              </p>
            </div>

            <form onSubmit={handleBuyerSearch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type or Industry
                </label>
                <input
                  type="text"
                  name="query"
                  placeholder="e.g., Electronics retailers, Fashion importers"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., New York, USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Be specific about the type of business
                  you're looking for. Examples: "Electronics importers",
                  "Fashion wholesale", "Food distributors"
                </p>
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
                  disabled={isSearching}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {isSearching ? "Searching..." : "Find Buyers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
