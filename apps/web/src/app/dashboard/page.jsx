"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Globe,
  Plus,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Home,
  X,
  Activity,
  Package,
  Target,
  Filter,
  FileText,
  DollarSign,
  Building,
  Shield,
  Download,
  Brain,
} from "lucide-react";

// Import tab components
import DashboardTab from "./components/DashboardTab";
import TargetMarketSelectionTab from "./components/TargetMarketSelectionTab";
import MarketOverviewTab from "./components/MarketOverviewTab";
import MarketChangesTab from "./components/MarketChangesTab";
import ProductAnalysisTab from "./components/ProductAnalysisTab";
import PriceAnalysisTab from "./components/PriceAnalysisTab";
import BusinessDirectoryTab from "./components/BusinessDirectoryTab";
import CustomDutiesTab from "./components/CustomDutiesTab";
import CampaignsTab from "./components/CampaignsTab";
import AIPredictionsTab from "./components/AIPredictionsTab";
import SettingsTab from "./components/SettingsTab";

export default function DashboardPage() {
  const { data: user, loading } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isExporting, setIsExporting] = useState(false);

  // Global filters state
  const [globalFilters, setGlobalFilters] = useState({
    hsCode: "",
    targetCountry: "",
    exporterCountry: "TR",
    year: "2024",
    month: "",
    selectedMainCategory: "",
    selectedSubCategory: "",
    selectedProduct: "",
  });

  // GTIP codes state
  const [gtipData, setGtipData] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch GTIP codes
  const { data: gtipCodesData } = useQuery({
    queryKey: ["gtip-codes"],
    queryFn: async () => {
      const res = await fetch("/api/gtip-codes");
      if (!res.ok) throw new Error("Failed to fetch GTIP codes");
      return res.json();
    },
    enabled: !!user,
  });

  // Update GTIP data when fetched
  useEffect(() => {
    if (gtipCodesData?.gtipCodes) {
      setGtipData(gtipCodesData.gtipCodes);
    }
  }, [gtipCodesData]);

  const company = companiesData?.companies?.[0];

  const navItems = [
    { name: "Dashboard", icon: Home, desc: "Overview & Analytics" },
    { name: "AI Predictions", icon: Brain, desc: "AI Market Forecasting" },
    {
      name: "Hedef Pazar Seçimi",
      icon: Target,
      desc: "Target Market Selection",
    },
    { name: "Pazarın Genel Görünümü", icon: Globe, desc: "Market Overview" },
    { name: "Pazardaki Değişimler", icon: TrendingUp, desc: "Market Changes" },
    { name: "Ürün Analizi", icon: Package, desc: "Product Analysis" },
    { name: "Fiyat Analizi", icon: DollarSign, desc: "Price Analysis" },
    { name: "Business Directory", icon: Building, desc: "Company Database" },
    { name: "Gümrük Vergileri", icon: Shield, desc: "Custom Duties" },
    { name: "E-Posta Gönderimi", icon: Activity, desc: "Email Campaigns" },
    { name: "Settings", icon: Settings, desc: "Account Settings" },
  ];

  // Export Data functionality
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      let exportData = [];
      let filename = "";

      switch (activeNav) {
        case "Dashboard":
          // Export summary data
          const [campaigns, buyers, reports, products] = await Promise.all([
            fetch(`/api/campaigns?company_id=${company.id}`).then((res) =>
              res.json(),
            ),
            fetch(`/api/potential-buyers?company_id=${company.id}`).then(
              (res) => res.json(),
            ),
            fetch(`/api/market-reports?company_id=${company.id}`).then((res) =>
              res.json(),
            ),
            fetch(`/api/products?company_id=${company.id}`).then((res) =>
              res.json(),
            ),
          ]);

          exportData = [
            {
              category: "Active Campaigns",
              count: campaigns.campaigns?.length || 0,
            },
            { category: "Potential Buyers", count: buyers.buyers?.length || 0 },
            { category: "Market Reports", count: reports.reports?.length || 0 },
            { category: "Products", count: products.products?.length || 0 },
          ];
          filename = "dashboard-summary";
          break;

        case "E-Posta Gönderimi":
          const campaignsRes = await fetch(
            `/api/campaigns?company_id=${company.id}`,
          );
          const campaignsData = await campaignsRes.json();
          exportData = campaignsData.campaigns || [];
          filename = "email-campaigns";
          break;

        case "Business Directory":
          const buyersRes = await fetch(
            `/api/potential-buyers?company_id=${company.id}`,
          );
          const buyersData = await buyersRes.json();
          exportData = buyersData.buyers || [];
          filename = "potential-buyers";
          break;

        default:
          exportData = [
            { message: "No data available for export in this section" },
          ];
          filename = "export-data";
      }

      // Convert to CSV
      if (exportData.length === 0) {
        alert("No data to export");
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header] || "";
              // Escape commas and quotes
              return typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(","),
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle main category selection
  const handleMainCategoryChange = (categoryCode) => {
    setGlobalFilters((prev) => ({
      ...prev,
      selectedMainCategory: categoryCode,
      selectedSubCategory: "",
      selectedProduct: "",
      hsCode: "",
    }));

    if (categoryCode && gtipData?.[categoryCode]) {
      setAvailableSubCategories(
        Object.entries(gtipData[categoryCode].subcategories),
      );
      setAvailableProducts([]);
    } else {
      setAvailableSubCategories([]);
      setAvailableProducts([]);
    }
  };

  // Handle sub category selection
  const handleSubCategoryChange = (subCategoryCode) => {
    setGlobalFilters((prev) => ({
      ...prev,
      selectedSubCategory: subCategoryCode,
      selectedProduct: "",
      hsCode: "",
    }));

    if (
      subCategoryCode &&
      gtipData?.[globalFilters.selectedMainCategory]?.subcategories?.[
        subCategoryCode
      ]
    ) {
      const products =
        gtipData[globalFilters.selectedMainCategory].subcategories[
          subCategoryCode
        ].products;
      setAvailableProducts(products);
    } else {
      setAvailableProducts([]);
    }
  };

  // Handle product selection
  const handleProductChange = (productCode) => {
    setGlobalFilters((prev) => ({
      ...prev,
      selectedProduct: productCode,
      hsCode: productCode,
    }));
  };

  // Render active tab content
  const renderActiveTab = () => {
    if (!company && activeNav !== "Settings") {
      return (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to ExportAI!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Complete your company setup to access all features and start
            discovering global markets.
          </p>
          <a
            href="/onboarding"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Complete Setup
          </a>
        </div>
      );
    }

    switch (activeNav) {
      case "Dashboard":
        return (
          <DashboardTab
            company={company}
            filters={globalFilters}
            setActiveNav={setActiveNav}
          />
        );
      case "AI Predictions":
        return <AIPredictionsTab company={company} filters={globalFilters} />;
      case "Hedef Pazar Seçimi":
        return (
          <TargetMarketSelectionTab
            company={company}
            filters={globalFilters}
            setFilters={setGlobalFilters}
          />
        );
      case "Pazarın Genel Görünümü":
        return <MarketOverviewTab company={company} filters={globalFilters} />;
      case "Pazardaki Değişimler":
        return <MarketChangesTab company={company} filters={globalFilters} />;
      case "Ürün Analizi":
        return <ProductAnalysisTab company={company} filters={globalFilters} />;
      case "Fiyat Analizi":
        return <PriceAnalysisTab company={company} filters={globalFilters} />;
      case "Business Directory":
        return (
          <BusinessDirectoryTab company={company} filters={globalFilters} />
        );
      case "Gümrük Vergileri":
        return <CustomDutiesTab company={company} filters={globalFilters} />;
      case "E-Posta Gönderimi":
        return <CampaignsTab company={company} filters={globalFilters} />;
      case "Settings":
        return <SettingsTab company={company} />;
      default:
        return (
          <DashboardTab
            company={company}
            filters={globalFilters}
            setActiveNav={setActiveNav}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ExportAI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter">
      {/* Left Navigation Drawer */}
      <div
        className={`fixed md:relative z-50 w-72 flex-shrink-0 bg-white dark:bg-gray-800 flex flex-col transition-transform duration-300 shadow-lg md:shadow-none border-r border-gray-200 dark:border-gray-700 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ExportAI Menu
          </h1>
          <button onClick={() => setDrawerOpen(false)} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop menu title */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ExportAI
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trade Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-left ${
                activeNav === item.name
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.name}</div>
                <div
                  className={`text-xs truncate ${activeNav === item.name ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/account/logout"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium text-sm w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </a>
        </div>
      </div>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Global Filters */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global Filters */}
            <div className="flex-1 flex items-center gap-3 mx-4 md:mx-8 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block whitespace-nowrap">
                  GTIP Kodu:
                </span>
              </div>

              {/* Main Category Dropdown */}
              <select
                value={globalFilters.selectedMainCategory}
                onChange={(e) => handleMainCategoryChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="">Ana Kategori Seçin</option>
                {gtipData &&
                  Object.entries(gtipData).map(([code, category]) => (
                    <option key={code} value={code}>
                      {category.name}
                    </option>
                  ))}
              </select>

              {/* Sub Category Dropdown */}
              <select
                value={globalFilters.selectedSubCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!globalFilters.selectedMainCategory}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Alt Kategori Seçin</option>
                {availableSubCategories.map(([code, subCategory]) => (
                  <option key={code} value={code}>
                    {subCategory.name}
                  </option>
                ))}
              </select>

              {/* Product Dropdown */}
              <select
                value={globalFilters.selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={!globalFilters.selectedSubCategory}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Ürün Kodu</option>
                {availableProducts.map((productCode) => (
                  <option key={productCode} value={productCode}>
                    {productCode}
                  </option>
                ))}
              </select>

              {/* Target Country */}
              <select
                value={globalFilters.targetCountry}
                onChange={(e) =>
                  setGlobalFilters((prev) => ({
                    ...prev,
                    targetCountry: e.target.value,
                  }))
                }
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
              >
                <option value="">Hedef Ülke</option>
                <option value="US">ABD</option>
                <option value="DE">Almanya</option>
                <option value="UK">İngiltere</option>
                <option value="FR">Fransa</option>
                <option value="IT">İtalya</option>
                <option value="ES">İspanya</option>
                <option value="NL">Hollanda</option>
                <option value="JP">Japonya</option>
                <option value="CN">Çin</option>
                <option value="RU">Rusya</option>
                <option value="CA">Kanada</option>
                <option value="AU">Avustralya</option>
                <option value="BR">Brezilya</option>
                <option value="IN">Hindistan</option>
                <option value="KR">Güney Kore</option>
                <option value="MX">Meksika</option>
                <option value="SA">Suudi Arabistan</option>
                <option value="AE">BAE</option>
                <option value="EG">Mısır</option>
                <option value="ZA">Güney Afrika</option>
              </select>

              {/* Year */}
              <select
                value={globalFilters.year}
                onChange={(e) =>
                  setGlobalFilters((prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
                }
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[80px]"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>

              {/* Month */}
              <select
                value={globalFilters.month}
                onChange={(e) =>
                  setGlobalFilters((prev) => ({
                    ...prev,
                    month: e.target.value,
                  }))
                }
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[100px]"
              >
                <option value="">Tüm Aylar</option>
                <option value="01">Ocak</option>
                <option value="02">Şubat</option>
                <option value="03">Mart</option>
                <option value="04">Nisan</option>
                <option value="05">Mayıs</option>
                <option value="06">Haziran</option>
                <option value="07">Temmuz</option>
                <option value="08">Ağustos</option>
                <option value="09">Eylül</option>
                <option value="10">Ekim</option>
                <option value="11">Kasım</option>
                <option value="12">Aralık</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {activeNav}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {navItems.find((item) => item.name === activeNav)?.desc ||
                  "Export Intelligence & Analytics"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Data
                  </>
                )}
              </button>
              <a
                href="/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </a>
              {activeNav === "Hedef Pazar Seçimi" && (
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4" />
                  Analyze Market
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {renderActiveTab()}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
