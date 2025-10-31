import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import {
  Home,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Globe,
  BarChart3,
  Activity,
  Bell,
  User,
  Settings,
} from "lucide-react-native";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch companies data
  const { data: companiesData, refetch: refetchCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
    enabled: !!auth,
  });

  // Fetch dashboard stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!companiesData?.companies?.[0]) return null;

      const companyId = companiesData.companies[0].id;

      const [campaigns, buyers, reports, products] = await Promise.all([
        fetch(`/api/campaigns?company_id=${companyId}`).then((res) =>
          res.json(),
        ),
        fetch(`/api/potential-buyers?company_id=${companyId}`).then((res) =>
          res.json(),
        ),
        fetch(`/api/market-reports?company_id=${companyId}`).then((res) =>
          res.json(),
        ),
        fetch(`/api/products?company_id=${companyId}`).then((res) =>
          res.json(),
        ),
      ]);

      return {
        campaigns: campaigns.campaigns?.length || 0,
        buyers: buyers.buyers?.length || 0,
        reports: reports.reports?.length || 0,
        products: products.products?.length || 0,
      };
    },
    enabled: !!companiesData?.companies?.[0],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCompanies(), refetchStats()]);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const company = companiesData?.companies?.[0];

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mx-1">
      <View className="flex-row items-center justify-between mb-2">
        <View className={`p-2 rounded-lg bg-${color}-50`}>
          <Icon
            size={20}
            color={
              color === "blue"
                ? "#3B82F6"
                : color === "green"
                  ? "#10B981"
                  : color === "purple"
                    ? "#8B5CF6"
                    : "#F59E0B"
            }
          />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      </View>
      <Text className="text-sm font-semibold text-gray-900 mb-1">{title}</Text>
      {subtitle && <Text className="text-xs text-gray-500">{subtitle}</Text>}
    </View>
  );

  const QuickActionCard = ({ icon: Icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mx-1"
      activeOpacity={0.7}
    >
      <View className={`p-3 rounded-lg bg-${color}-50 mb-3 self-start`}>
        <Icon
          size={24}
          color={
            color === "blue"
              ? "#3B82F6"
              : color === "green"
                ? "#10B981"
                : "#8B5CF6"
          }
        />
      </View>
      <Text className="text-sm font-semibold text-gray-900 mb-1">{title}</Text>
      <Text className="text-xs text-gray-500">{subtitle}</Text>
    </TouchableOpacity>
  );

  if (!auth) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="p-4 bg-blue-100 rounded-full mb-4">
            <User size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome to ExportAI
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Sign in to access your trade intelligence dashboard
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-sm text-gray-600">
              Export Intelligence & Analytics
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Bell size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {!company ? (
          // Welcome/Setup Card
          <View className="mx-4 mt-6">
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <View className="items-center">
                <View className="p-4 bg-blue-100 rounded-full mb-4">
                  <Globe size={32} color="#3B82F6" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Welcome to ExportAI!
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Complete your company setup to access all features and start
                  discovering global markets.
                </Text>
                <TouchableOpacity
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-lg"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold">
                    Complete Setup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Company Info */}
            <View className="mx-4 mt-6">
              <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4">
                <Text className="text-white text-lg font-bold mb-1">
                  {company.company_name}
                </Text>
                <Text className="text-blue-100 text-sm">
                  {company.industry} • {company.country}
                </Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="mx-3 mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">
                Overview
              </Text>
              <View className="flex-row mb-3">
                <StatCard
                  icon={Globe}
                  title="Markets Analyzed"
                  value={statsData?.reports || 0}
                  color="blue"
                  subtitle="+12% this month"
                />
                <StatCard
                  icon={Users}
                  title="Qualified Buyers"
                  value={statsData?.buyers || 0}
                  color="green"
                  subtitle="+8% this month"
                />
              </View>
              <View className="flex-row">
                <StatCard
                  icon={Activity}
                  title="Active Campaigns"
                  value={statsData?.campaigns || 0}
                  color="purple"
                  subtitle="+15% this month"
                />
                <StatCard
                  icon={Package}
                  title="Products"
                  value={statsData?.products || 0}
                  color="yellow"
                  subtitle="Ready for export"
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View className="mx-3 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">
                Quick Actions
              </Text>
              <View className="flex-row mb-3">
                <QuickActionCard
                  icon={TrendingUp}
                  title="AI Predictions"
                  subtitle="Get market forecasts"
                  color="blue"
                  onPress={() => {}}
                />
                <QuickActionCard
                  icon={BarChart3}
                  title="Market Analysis"
                  subtitle="Analyze target markets"
                  color="green"
                  onPress={() => {}}
                />
              </View>
              <View className="flex-row">
                <QuickActionCard
                  icon={Users}
                  title="Find Buyers"
                  subtitle="Discover potential customers"
                  color="purple"
                  onPress={() => {}}
                />
                <QuickActionCard
                  icon={DollarSign}
                  title="Price Optimization"
                  subtitle="Optimize your pricing"
                  color="blue"
                  onPress={() => {}}
                />
              </View>
            </View>

            {/* Recent Activity */}
            <View className="mx-4 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Recent Activity
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100">
                <View className="p-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="p-2 bg-green-100 rounded-lg mr-3">
                      <TrendingUp size={16} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        Market analysis completed
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Germany textile market report generated
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">2h ago</Text>
                  </View>
                </View>
                <View className="p-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Users size={16} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        New buyer matched
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Fashion retailer in UK shows interest
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">1d ago</Text>
                  </View>
                </View>
                <View className="p-4">
                  <View className="flex-row items-center">
                    <View className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Package size={16} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        Product added
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Cotton T-shirts added to catalog
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">3d ago</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
