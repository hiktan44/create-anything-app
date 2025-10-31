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
  Globe,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3,
  DollarSign,
  ArrowRight,
  MapPin,
} from "lucide-react-native";

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock market data
  const marketData = [
    {
      id: 1,
      country: "Germany",
      flag: "🇩🇪",
      industry: "Textiles",
      importValue: 245.6,
      growth: 12.5,
      opportunities: "High",
      status: "growing",
    },
    {
      id: 2,
      country: "United States",
      flag: "🇺🇸",
      industry: "Electronics",
      importValue: 892.1,
      growth: 8.7,
      opportunities: "Very High",
      status: "stable",
    },
    {
      id: 3,
      country: "United Kingdom",
      flag: "🇬🇧",
      industry: "Fashion",
      importValue: 156.3,
      growth: -2.1,
      opportunities: "Medium",
      status: "declining",
    },
    {
      id: 4,
      country: "France",
      flag: "🇫🇷",
      industry: "Cosmetics",
      importValue: 187.9,
      growth: 15.2,
      opportunities: "High",
      status: "growing",
    },
    {
      id: 5,
      country: "Japan",
      flag: "🇯🇵",
      industry: "Technology",
      importValue: 432.7,
      growth: 6.8,
      opportunities: "Very High",
      status: "stable",
    },
  ];

  const filters = [
    { id: "all", label: "All Markets" },
    { id: "growing", label: "Growing" },
    { id: "stable", label: "Stable" },
    { id: "declining", label: "Declining" },
  ];

  const filteredMarkets =
    selectedFilter === "all"
      ? marketData
      : marketData.filter((market) => market.status === selectedFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const MarketCard = ({ market }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{market.flag}</Text>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {market.country}
            </Text>
            <Text className="text-sm text-gray-600">{market.industry}</Text>
          </View>
        </View>
        <View className="items-end">
          <View className="flex-row items-center">
            {market.growth > 0 ? (
              <TrendingUp size={16} color="#10B981" />
            ) : (
              <TrendingDown size={16} color="#EF4444" />
            )}
            <Text
              className={`text-sm font-semibold ml-1 ${
                market.growth > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {market.growth > 0 ? "+" : ""}
              {market.growth}%
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-xs text-gray-500">Import Value</Text>
          <Text className="text-lg font-bold text-gray-900">
            ${market.importValue}M
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Opportunities</Text>
          <View
            className={`px-2 py-1 rounded-full ${
              market.opportunities === "Very High"
                ? "bg-green-100"
                : market.opportunities === "High"
                  ? "bg-blue-100"
                  : "bg-yellow-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                market.opportunities === "Very High"
                  ? "text-green-700"
                  : market.opportunities === "High"
                    ? "text-blue-700"
                    : "text-yellow-700"
              }`}
            >
              {market.opportunities}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MapPin size={14} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">
            Market Analysis Available
          </Text>
        </View>
        <ArrowRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  if (!auth) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="p-4 bg-blue-100 rounded-full mb-4">
            <Globe size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Global Market Access
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Sign in to explore international market opportunities
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
            <Text className="text-2xl font-bold text-gray-900">
              Global Markets
            </Text>
            <Text className="text-sm text-gray-600">
              Discover export opportunities worldwide
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Filter size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Market Summary */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-200">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Market Overview
        </Text>
        <View className="flex-row justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <BarChart3 size={16} color="#3B82F6" />
              <Text className="text-sm text-gray-600 ml-2">Total Markets</Text>
            </View>
            <Text className="text-2xl font-bold text-blue-600">127</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#10B981" />
              <Text className="text-sm text-gray-600 ml-2">
                Growing Markets
              </Text>
            </View>
            <Text className="text-2xl font-bold text-green-600">89</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-2">Avg Growth</Text>
            </View>
            <Text className="text-2xl font-bold text-yellow-600">8.2%</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mx-4 mt-4"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-full mr-3 ${
              selectedFilter === filter.id
                ? "bg-blue-600"
                : "bg-white border border-gray-200"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`font-medium ${
                selectedFilter === filter.id ? "text-white" : "text-gray-600"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Markets List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </ScrollView>
    </View>
  );
}
