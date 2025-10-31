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
  Package,
  Plus,
  Filter,
  Search,
  MoreVertical,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  DollarSign,
} from "lucide-react-native";

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch products data
  const { data: productsData, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!auth,
  });

  // Mock product data if no real data
  const mockProducts = [
    {
      id: 1,
      product_name: "Cotton T-Shirts",
      category: "Apparel",
      hs_code: "6109.10",
      unit_price: 12.5,
      currency: "USD",
      material: "Cotton",
      image_url: null,
      description: "High quality cotton t-shirts for export",
      markets: ["Germany", "USA", "UK"],
      performance: {
        views: 245,
        inquiries: 23,
        orders: 8,
        rating: 4.8,
      },
    },
    {
      id: 2,
      product_name: "Denim Jeans",
      category: "Apparel",
      hs_code: "6203.42",
      unit_price: 28.9,
      currency: "USD",
      material: "Denim",
      image_url: null,
      description: "Premium denim jeans with modern fit",
      markets: ["France", "Italy", "Spain"],
      performance: {
        views: 189,
        inquiries: 15,
        orders: 5,
        rating: 4.6,
      },
    },
    {
      id: 3,
      product_name: "Leather Shoes",
      category: "Footwear",
      hs_code: "6403.91",
      unit_price: 45.0,
      currency: "USD",
      material: "Leather",
      image_url: null,
      description: "Handcrafted leather shoes for business",
      markets: ["Japan", "Australia", "Canada"],
      performance: {
        views: 312,
        inquiries: 41,
        orders: 12,
        rating: 4.9,
      },
    },
  ];

  const products = productsData?.products || mockProducts;

  const categories = [
    { id: "all", label: "All Products" },
    { id: "Apparel", label: "Apparel" },
    { id: "Footwear", label: "Footwear" },
    { id: "Electronics", label: "Electronics" },
    { id: "Home & Garden", label: "Home & Garden" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh products");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddProduct = () => {
    Alert.alert("Add Product", "This feature will be available soon");
  };

  const ProductCard = ({ product }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Product Image Placeholder */}
      <View className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <Package size={32} color="#9CA3AF" />
      </View>

      {/* Product Info */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {product.product_name}
          </Text>
          <Text className="text-sm text-gray-600">
            {product.category} • HS: {product.hs_code}
          </Text>
        </View>
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Price and Material */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-blue-600">
          ${product.unit_price} {product.currency}
        </Text>
        <View className="px-2 py-1 bg-gray-100 rounded-full">
          <Text className="text-xs font-medium text-gray-700">
            {product.material}
          </Text>
        </View>
      </View>

      {/* Performance Metrics */}
      {product.performance && (
        <View className="flex-row justify-between items-center mb-3 p-3 bg-gray-50 rounded-lg">
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">
              {product.performance.views}
            </Text>
            <Text className="text-xs text-gray-500">Views</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">
              {product.performance.inquiries}
            </Text>
            <Text className="text-xs text-gray-500">Inquiries</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">
              {product.performance.orders}
            </Text>
            <Text className="text-xs text-gray-500">Orders</Text>
          </View>
          <View className="flex-row items-center">
            <Star size={14} color="#F59E0B" />
            <Text className="text-sm font-semibold text-gray-900 ml-1">
              {product.performance.rating}
            </Text>
          </View>
        </View>
      )}

      {/* Target Markets */}
      {product.markets && (
        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-2">Target Markets:</Text>
          <View className="flex-row flex-wrap">
            {product.markets.slice(0, 3).map((market, index) => (
              <View
                key={index}
                className="px-2 py-1 bg-blue-100 rounded-full mr-2 mb-1"
              >
                <Text className="text-xs font-medium text-blue-700">
                  {market}
                </Text>
              </View>
            ))}
            {product.markets.length > 3 && (
              <View className="px-2 py-1 bg-gray-100 rounded-full">
                <Text className="text-xs font-medium text-gray-700">
                  +{product.markets.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity className="flex-row items-center px-3 py-2 bg-blue-100 rounded-lg flex-1 mr-2">
          <Eye size={16} color="#3B82F6" />
          <Text className="text-blue-600 font-medium ml-2">View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg">
          <Edit size={16} color="#6B7280" />
          <Text className="text-gray-600 font-medium ml-2">Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!auth) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="p-4 bg-blue-100 rounded-full mb-4">
            <Package size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Product Catalog
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Sign in to manage your export products and track performance
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
            <Text className="text-2xl font-bold text-gray-900">Products</Text>
            <Text className="text-sm text-gray-600">
              Manage your export catalog
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddProduct}
            className="p-2 bg-blue-600 rounded-lg"
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-200">
        <Text className="text-lg font-bold text-gray-900 mb-3">Overview</Text>
        <View className="flex-row justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Package size={16} color="#3B82F6" />
              <Text className="text-sm text-gray-600 ml-2">Total Products</Text>
            </View>
            <Text className="text-2xl font-bold text-blue-600">
              {products.length}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#10B981" />
              <Text className="text-sm text-gray-600 ml-2">Top Performer</Text>
            </View>
            <Text className="text-lg font-bold text-green-600 truncate">
              {products.length > 0 ? products[0].product_name : "No products"}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-2">Avg Price</Text>
            </View>
            <Text className="text-lg font-bold text-yellow-600">
              $
              {products.length > 0
                ? (
                    products.reduce((sum, p) => sum + p.unit_price, 0) /
                    products.length
                  ).toFixed(2)
                : "0"}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mx-4 mt-4"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full mr-3 ${
              selectedCategory === category.id
                ? "bg-blue-600"
                : "bg-white border border-gray-200"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`font-medium ${
                selectedCategory === category.id
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
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
        {filteredProducts.length === 0 ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <Package size={48} color="#9CA3AF" />
            <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">
              No Products Found
            </Text>
            <Text className="text-gray-600 mb-6">
              {selectedCategory === "all"
                ? "Start by adding your first product to the catalog"
                : `No products found in ${selectedCategory} category`}
            </Text>
            <TouchableOpacity
              onPress={handleAddProduct}
              className="bg-blue-600 px-6 py-3 rounded-lg self-center"
            >
              <Text className="text-white font-semibold">Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
