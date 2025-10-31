"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  Brain,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", selectedFilter],
    queryFn: async () => {
      const unreadOnly = selectedFilter === "unread";
      const res = await fetch(
        `/api/notifications?unread_only=${unreadOnly}&limit=20`,
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Mark notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_ids: notificationIds,
          mark_as_read: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-mark as read when opening
  useEffect(() => {
    if (isOpen && notificationsData?.notifications) {
      const unreadIds = notificationsData.notifications
        .filter((n) => !n.read)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        setTimeout(() => {
          markAsReadMutation.mutate(unreadIds);
        }, 2000); // Mark as read after 2 seconds of viewing
      }
    }
  }, [isOpen, notificationsData]);

  const getNotificationIcon = (type) => {
    const iconProps = { size: 16 };

    switch (type) {
      case "market_alert":
        return <TrendingUp {...iconProps} className="text-blue-600" />;
      case "buyer_match":
        return <Users {...iconProps} className="text-green-600" />;
      case "campaign_update":
        return <Mail {...iconProps} className="text-purple-600" />;
      case "price_alert":
        return <DollarSign {...iconProps} className="text-yellow-600" />;
      case "ai_insight":
        return <Brain {...iconProps} className="text-indigo-600" />;
      case "warning":
        return <AlertTriangle {...iconProps} className="text-orange-600" />;
      default:
        return <Info {...iconProps} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type, read) => {
    if (read) return "bg-gray-50 border-gray-200";

    switch (type) {
      case "market_alert":
        return "bg-blue-50 border-blue-200";
      case "buyer_match":
        return "bg-green-50 border-green-200";
      case "campaign_update":
        return "bg-purple-50 border-purple-200";
      case "price_alert":
        return "bg-yellow-50 border-yellow-200";
      case "ai_insight":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const unreadCount = notificationsData?.unread_count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition ${
                  selectedFilter === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("unread")}
                className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition ${
                  selectedFilter === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Loading notifications...
                </p>
              </div>
            ) : notificationsData?.notifications?.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificationsData?.notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatTimeAgo(notification.created_at)}
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() =>
                                markAsReadMutation.mutate([notification.id])
                              }
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificationsData?.notifications?.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const unreadIds = notificationsData.notifications
                      .filter((n) => !n.read)
                      .map((n) => n.id);
                    if (unreadIds.length > 0) {
                      markAsReadMutation.mutate(unreadIds);
                    }
                  }}
                  disabled={unreadCount === 0 || markAsReadMutation.isLoading}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
