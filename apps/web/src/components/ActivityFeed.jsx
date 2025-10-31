"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  TrendingUp,
  Users,
  Mail,
  Package,
  Brain,
  Globe,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ActivityFeed({ company }) {
  const [activities, setActivities] = useState([]);

  // Fetch real-time activities
  const { data: activitiesData } = useQuery({
    queryKey: ["activities", company?.id],
    queryFn: async () => {
      // Mock real-time activities - in real app would connect to WebSocket or SSE
      const mockActivities = [
        {
          id: 1,
          type: "market_analysis",
          title: "Market Analysis Completed",
          description:
            "Germany textile market report generated with 15% growth potential",
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          data: { country: "Germany", growth: 15.2, industry: "Textiles" },
          status: "success",
        },
        {
          id: 2,
          type: "buyer_match",
          title: "New Buyer Match Found",
          description:
            "Fashion Plus Ltd from UK shows high interest in cotton products",
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          data: { buyer: "Fashion Plus Ltd", country: "UK", match_score: 92 },
          status: "info",
        },
        {
          id: 3,
          type: "email_campaign",
          title: "Email Campaign Update",
          description:
            "Q4 Outreach campaign achieved 24% open rate, above industry average",
          timestamp: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
          data: { campaign: "Q4 Outreach", open_rate: 24, industry_avg: 18.2 },
          status: "success",
        },
        {
          id: 4,
          type: "ai_prediction",
          title: "AI Market Prediction",
          description:
            "Sustainable textiles demand predicted to grow 22% in Q1 2025",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          data: { trend: "sustainable_textiles", growth: 22, confidence: 87 },
          status: "info",
        },
        {
          id: 5,
          type: "product_added",
          title: "Product Added to Catalog",
          description:
            "Cotton T-shirts with competitive pricing added successfully",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          data: { product: "Cotton T-shirts", price: 12.99, currency: "USD" },
          status: "success",
        },
        {
          id: 6,
          type: "price_optimization",
          title: "Price Optimization Alert",
          description:
            "Consider adjusting EU market prices based on competitor analysis",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          data: { market: "EU", suggested_change: -5.2, current_avg: 24.8 },
          status: "warning",
        },
      ];

      return { activities: mockActivities };
    },
    enabled: !!company,
    refetchInterval: 15000, // Refetch every 15 seconds for real-time feel
  });

  useEffect(() => {
    if (activitiesData?.activities) {
      setActivities(activitiesData.activities);
    }
  }, [activitiesData]);

  const getActivityIcon = (type) => {
    const iconProps = { size: 18 };

    switch (type) {
      case "market_analysis":
        return <TrendingUp {...iconProps} className="text-blue-600" />;
      case "buyer_match":
        return <Users {...iconProps} className="text-green-600" />;
      case "email_campaign":
        return <Mail {...iconProps} className="text-purple-600" />;
      case "ai_prediction":
        return <Brain {...iconProps} className="text-indigo-600" />;
      case "product_added":
        return <Package {...iconProps} className="text-orange-600" />;
      case "price_optimization":
        return <Globe {...iconProps} className="text-yellow-600" />;
      default:
        return <Activity {...iconProps} className="text-gray-600" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!company) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} />
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <Activity size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600">No company data available</p>
          <p className="text-sm text-gray-500">
            Complete your setup to see activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={20} />
          Real-time Activity
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">
              Activities will appear here in real-time
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`relative border-l-4 pl-4 pb-4 ${getActivityColor(activity.status)} ${
                index === 0 ? "animate-fadeIn" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 p-1.5 bg-white rounded-lg border border-gray-200">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>

                    {/* Activity Data Preview */}
                    {activity.data && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(activity.data)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200"
                            >
                              <span className="capitalize text-gray-500 mr-1">
                                {key.replace("_", " ")}:
                              </span>
                              {typeof value === "number" && key.includes("rate")
                                ? `${value}%`
                                : value}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium text-center">
          View all activity
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
