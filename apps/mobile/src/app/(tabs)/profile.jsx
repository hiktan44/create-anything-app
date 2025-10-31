import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Globe,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  Download,
} from "lucide-react-native";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  // Mock user data - in real app this would come from API
  const mockUser = {
    name: "John Doe",
    email: "john@exportco.com",
    company: "Export Solutions Ltd.",
    industry: "Textiles",
    country: "Turkey",
    phone: "+90 555 123 4567",
    location: "Istanbul, Turkey",
    memberSince: "2023",
    verified: true,
    stats: {
      products: 24,
      markets: 12,
      buyers: 156,
      rating: 4.8,
    },
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const ProfileRow = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightComponent,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="p-2 bg-gray-100 rounded-lg mr-4">
        <Icon size={20} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {rightComponent ||
        (showChevron && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <Icon size={20} color={color} />
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      </View>
      <Text className="text-sm text-gray-600">{label}</Text>
    </View>
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
            Your Profile
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Sign in to access your profile and account settings
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
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <Text className="text-sm text-gray-600">
              Manage your account and preferences
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Edit size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Text className="text-2xl font-bold text-white">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {mockUser.name}
                </Text>
                {mockUser.verified && (
                  <View className="ml-2 p-1 bg-blue-100 rounded-full">
                    <Text className="text-xs text-blue-600">✓</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600">{mockUser.email}</Text>
              <Text className="text-sm text-gray-500">
                Member since {mockUser.memberSince}
              </Text>
            </View>
          </View>

          {/* Company Info */}
          <View className="p-3 bg-gray-50 rounded-lg">
            <View className="flex-row items-center mb-2">
              <Building size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-900 ml-2">
                {mockUser.company}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">
              {mockUser.industry} • {mockUser.country}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-3 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-4 px-1">
            Your Activity
          </Text>
          <View className="flex-row mb-3">
            <StatCard
              icon={Globe}
              label="Products"
              value={mockUser.stats.products}
              color="#3B82F6"
            />
            <StatCard
              icon={MapPin}
              label="Markets"
              value={mockUser.stats.markets}
              color="#10B981"
            />
          </View>
          <View className="flex-row">
            <StatCard
              icon={User}
              label="Buyers"
              value={mockUser.stats.buyers}
              color="#8B5CF6"
            />
            <StatCard
              icon={Star}
              label="Rating"
              value={mockUser.stats.rating}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Account Settings */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Account</Text>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <ProfileRow
              icon={User}
              title="Personal Information"
              subtitle="Edit your profile details"
              onPress={() => Alert.alert("Feature Coming Soon")}
            />
            <ProfileRow
              icon={Building}
              title="Company Settings"
              subtitle="Manage your business information"
              onPress={() => Alert.alert("Feature Coming Soon")}
            />
            <ProfileRow
              icon={Shield}
              title="Security & Privacy"
              subtitle="Password, two-factor authentication"
              onPress={() => Alert.alert("Feature Coming Soon")}
            />
          </View>
        </View>

        {/* Notifications */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Notifications
          </Text>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <ProfileRow
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive updates about your account"
              showChevron={false}
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                />
              }
            />
            <ProfileRow
              icon={Globe}
              title="Market Alerts"
              subtitle="Get notified about market changes"
              showChevron={false}
              rightComponent={
                <Switch
                  value={marketAlerts}
                  onValueChange={setMarketAlerts}
                  trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                />
              }
            />
            <ProfileRow
              icon={Mail}
              title="Email Reports"
              subtitle="Weekly summaries and insights"
              showChevron={false}
              rightComponent={
                <Switch
                  value={emailReports}
                  onValueChange={setEmailReports}
                  trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                />
              }
            />
          </View>
        </View>

        {/* Support */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Support</Text>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <ProfileRow
              icon={HelpCircle}
              title="Help Center"
              subtitle="FAQs and support articles"
              onPress={() =>
                Alert.alert("Help Center", "Opening help center...")
              }
            />
            <ProfileRow
              icon={Download}
              title="Export Data"
              subtitle="Download your account data"
              onPress={() =>
                Alert.alert("Export Data", "Data export will begin...")
              }
            />
            <ProfileRow
              icon={LogOut}
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={handleSignOut}
              showChevron={false}
            />
          </View>
        </View>

        {/* App Info */}
        <View className="mx-4 mt-6 mb-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <Text className="text-center text-gray-500 text-sm">
              ExportAI v1.0.0
            </Text>
            <Text className="text-center text-gray-400 text-xs mt-1">
              Trade Intelligence Platform
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
