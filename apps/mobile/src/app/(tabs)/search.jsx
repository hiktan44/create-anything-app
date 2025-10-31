import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import {
  Search,
  Filter,
  MapPin,
  Package,
  Users,
  TrendingUp,
  Globe,
  Star,
  Clock,
  X,
} from "lucide-react-native";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("products");
  const [recentSearches, setRecentSearches] = useState([
    "Cotton T-shirts Germany",
    "Electronics USA",
    "Textile buyers Europe",
    "Fashion trends 2024",
  ]);

  // Keyboard animation handling for non-tab navigation
  const focusedPadding = 12;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = () => {
    if (Platform.OS === "web") {
      return;
    }
    // Since this is in (tabs), we don't need special padding animation
  };

  const handleInputBlur = () => {
    if (Platform.OS === "web") {
      return;
    }
    // Since this is in (tabs), we don't need special padding animation
  };

  const searchTypes = [
    { id: "products", label: "Products", icon: Package },
    { id: "markets", label: "Markets", icon: Globe },
    { id: "buyers", label: "Buyers", icon: Users },
    { id: "trends", label: "Trends", icon: TrendingUp },
  ];

  const mockResults = {
    products: [
      {
        id: 1,
        name: "Cotton T-Shirts",
        category: "Apparel",
        hsCode: "6109.10",
        avgPrice: "$12.50",
        exporters: 156,
        rating: 4.8,
      },
      {
        id: 2,
        name: "Denim Jeans",
        category: "Apparel",
        hsCode: "6203.42",
        avgPrice: "$28.90",
        exporters: 89,
        rating: 4.6,
      },
    ],
    markets: [
      {
        id: 1,
        country: "Germany",
        flag: "🇩🇪",
        importValue: "$245.6M",
        growth: "+12.5%",
        opportunity: "High",
      },
      {
        id: 2,
        country: "United States",
        flag: "🇺🇸",
        importValue: "$892.1M",
        growth: "+8.7%",
        opportunity: "Very High",
      },
    ],
    buyers: [
      {
        id: 1,
        company: "Fashion House Berlin",
        country: "Germany",
        industry: "Retail",
        size: "Large",
        lastOrder: "2 weeks ago",
      },
      {
        id: 2,
        company: "StyleCorp USA",
        country: "United States",
        industry: "E-commerce",
        size: "Medium",
        lastOrder: "1 month ago",
      },
    ],
    trends: [
      {
        id: 1,
        trend: "Sustainable Fashion",
        growth: "+45%",
        timeframe: "Last 6 months",
        markets: ["EU", "US", "Canada"],
      },
      {
        id: 2,
        trend: "Organic Cotton",
        growth: "+32%",
        timeframe: "Last year",
        markets: ["Germany", "UK", "France"],
      },
    ],
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
      }
    }
  };

  const clearRecentSearch = (searchToRemove) => {
    setRecentSearches(
      recentSearches.filter((search) => search !== searchToRemove),
    );
  };

  const ResultCard = ({ item, type }) => {
    switch (type) {
      case "products":
        return (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {item.category} • HS: {item.hsCode}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Star size={14} color="#F59E0B" />
                <Text className="text-sm text-gray-600 ml-1">
                  {item.rating}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-blue-600">
                {item.avgPrice}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.exporters} exporters
              </Text>
            </View>
          </TouchableOpacity>
        );

      case "markets":
        return (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{item.flag}</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {item.country}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-green-600">
                {item.growth}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">
                {item.importValue}
              </Text>
              <View className="px-2 py-1 bg-blue-100 rounded-full">
                <Text className="text-xs font-semibold text-blue-700">
                  {item.opportunity}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case "buyers":
        return (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {item.company}
                </Text>
                <Text className="text-sm text-gray-600">
                  {item.industry} • {item.country}
                </Text>
              </View>
              <View className="px-2 py-1 bg-gray-100 rounded-full">
                <Text className="text-xs font-semibold text-gray-700">
                  {item.size}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500 ml-1">
                Last order: {item.lastOrder}
              </Text>
            </View>
          </TouchableOpacity>
        );

      case "trends":
        return (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900 flex-1">
                {item.trend}
              </Text>
              <Text className="text-sm font-semibold text-green-600">
                {item.growth}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mb-2">{item.timeframe}</Text>
            <Text className="text-sm text-blue-600">
              Popular in: {item.markets.join(", ")}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  if (!auth) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="p-4 bg-blue-100 rounded-full mb-4">
            <Search size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Smart Search
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Sign in to search products, markets, buyers and trends
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
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, paddingTop: insets.top }}
      behavior="padding"
      className="bg-gray-50"
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Search</Text>
        <Text className="text-sm text-gray-600">
          Find products, markets, buyers & trends
        </Text>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search for anything..."
            className="flex-1 ml-3 text-gray-900"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white px-4 py-3 border-b border-gray-200"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {searchTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => setSearchType(type.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
                searchType === type.id ? "bg-blue-600" : "bg-gray-100"
              }`}
              activeOpacity={0.8}
            >
              <IconComponent
                size={16}
                color={searchType === type.id ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                className={`ml-2 font-medium ${
                  searchType === type.id ? "text-white" : "text-gray-600"
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.length === 0 ? (
          // Recent Searches & Suggestions
          <View className="px-4 pt-6">
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Recent Searches
                </Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSearchQuery(search)}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <Clock size={16} color="#6B7280" />
                      <Text className="text-gray-900 ml-3 flex-1">
                        {search}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => clearRecentSearch(search)}>
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View>
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Popular Searches
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  "Cotton",
                  "Germany",
                  "Electronics",
                  "Fashion",
                  "USA",
                  "Textiles",
                ].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setSearchQuery(tag)}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-blue-700 font-medium">{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          // Search Results
          <View className="px-4 pt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">
                {searchType.charAt(0).toUpperCase() + searchType.slice(1)}{" "}
                Results
              </Text>
              <TouchableOpacity>
                <Filter size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {mockResults[searchType]?.map((item) => (
              <ResultCard key={item.id} item={item} type={searchType} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
