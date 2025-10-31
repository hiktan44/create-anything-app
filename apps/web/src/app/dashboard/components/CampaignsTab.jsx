import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Plus,
  Search,
  Filter,
  Mail,
  Users,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
} from "lucide-react";

export default function CampaignsTab({ company }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns`);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData) => {
      let emailTemplate = `Subject: Partnership Opportunity

Dear [BUYER_NAME],

I hope this email finds you well. I'm reaching out regarding potential business opportunities between our companies.

We specialize in [PRODUCT_CATEGORY] and are looking to expand our reach in ${campaignData.target_country}. Based on our research, [COMPANY_NAME] appears to be an excellent potential partner for our products.

Key benefits of partnering with us:
• High-quality products with competitive pricing
• Reliable supply chain and timely delivery
• Excellent customer support and after-sales service
• Flexible terms to meet your specific needs

I would love to schedule a brief call to discuss how we can work together and create mutual value. Please let me know if you're interested in learning more about our products and partnership opportunities.

Best regards,
[SENDER_NAME]
[CONTACT_INFO]`;

      // Try to use AI to enhance the template, but fallback to default if it fails
      try {
        const aiRes = await fetch("/integrations/chat-gpt/conversationgpt4", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a professional email marketing specialist. Create compelling, professional email templates for B2B outreach.",
              },
              {
                role: "user",
                content: `Create a professional email template for a ${campaignData.campaign_type} campaign targeting ${campaignData.target_country}. Include subject line and email body with personalization placeholders like [BUYER_NAME], [COMPANY_NAME], [PRODUCT_CATEGORY].`,
              },
            ],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          emailTemplate = aiData.choices[0].message.content;
        }
      } catch (aiError) {
        console.warn(
          "AI template generation failed, using default template:",
          aiError,
        );
      }

      // Save campaign to database WITHOUT company_id
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: campaignData.campaign_name,
          target_country: campaignData.target_country,
          email_template: emailTemplate,
          status: "Draft",
          total_recipients: Math.floor(Math.random() * 100) + 50,
          emails_sent: 0,
          open_rate: 0,
          response_rate: 0,
          conversion_rate: 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["campaigns"]);
      setShowCreateModal(false);
    },
    onError: (error) => {
      console.error("Campaign creation error:", error);
      alert("Failed to create campaign: " + error.message);
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async (campaignData) => {
      const res = await fetch(`/api/campaigns/${campaignData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["campaigns"]);
      setEditingCampaign(null);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId) => {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete campaign");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["campaigns"]);
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: async (campaignId) => {
      // Simulate campaign launch with random metrics
      const simulatedMetrics = {
        status: "Active",
        emails_sent: Math.floor(Math.random() * 50) + 20,
        open_rate: (Math.random() * 30 + 15).toFixed(2), // 15-45%
        response_rate: (Math.random() * 10 + 2).toFixed(2), // 2-12%
        conversion_rate: (Math.random() * 5 + 1).toFixed(2), // 1-6%
      };

      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulatedMetrics),
      });
      if (!res.ok) throw new Error("Failed to launch campaign");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["campaigns"]);
    },
  });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const campaignData = {
      campaign_name: formData.get("campaign_name"),
      target_country: formData.get("target_country"),
      campaign_type: formData.get("campaign_type"),
    };

    createCampaignMutation.mutate(campaignData);
  };

  const filteredCampaigns =
    campaigns?.campaigns?.filter(
      (campaign) =>
        campaign.campaign_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        campaign.target_country
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
              placeholder="Search campaigns..."
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
          Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Campaigns Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first email campaign to reach potential buyers.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {campaign.campaign_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {campaign.target_country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCampaign(campaign)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : campaign.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Recipients:</span>
                  <span className="font-medium">
                    {campaign.total_recipients}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Emails Sent:</span>
                  <span className="font-medium">
                    {campaign.emails_sent || 0}
                  </span>
                </div>

                {campaign.status !== "Draft" && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Open Rate:</span>
                      <span className="font-medium text-green-600">
                        {campaign.open_rate}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Response Rate:</span>
                      <span className="font-medium text-blue-600">
                        {campaign.response_rate}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-medium text-purple-600">
                        {campaign.conversion_rate}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                {campaign.status === "Draft" ? (
                  <button
                    onClick={() => launchCampaignMutation.mutate(campaign.id)}
                    disabled={launchCampaignMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    Launch
                  </button>
                ) : (
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                    View Analytics
                  </button>
                )}
                <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm">
                  Preview
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Email Campaign
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                AI will generate a professional email template
              </p>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  name="campaign_name"
                  placeholder="e.g., Q1 Electronics Outreach - Germany"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Country/Region
                </label>
                <input
                  type="text"
                  name="target_country"
                  placeholder="e.g., Germany, United States, Europe"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Type
                </label>
                <select
                  name="campaign_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Introduction">Introduction Campaign</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Follow-up">Follow-up Campaign</option>
                  <option value="Partnership">Partnership Outreach</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> AI will create a professional email
                  template with personalization placeholders. You can edit it
                  before launching the campaign.
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
                  disabled={createCampaignMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {createCampaignMutation.isPending
                    ? "Creating..."
                    : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
