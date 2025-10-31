"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Check,
  Menu,
  X,
  BarChart3,
  Sparkles,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Market Data",
      description:
        "200+ countries, real-time trade data, import/export statistics at your fingertips.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description:
        "Automatic HS code detection, market recommendations, and trend predictions.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Buyer Discovery",
      description:
        "Find potential buyers with AI matching, compatibility scoring, and contact data.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Market Insights",
      description:
        "Interactive price trends, competition analysis, and growth opportunities.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automation Suite",
      description:
        "Bulk email campaigns, report generation, and CRM integration.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Custom Reports",
      description:
        "Build interactive market reports tailored to your business needs.",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Limited product analysis",
        "Basic market stats",
        "1 company profile",
        "Email support",
      ],
    },
    {
      name: "B2B Match",
      price: "$99",
      period: "/month",
      description: "For active exporters",
      features: [
        "Unlimited products",
        "Buyer discovery",
        "Email campaigns",
        "100+ buyer matches",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For consultants & agencies",
      features: [
        "Everything in B2B Match",
        "Advanced analytics",
        "Custom integrations",
        "API access",
        "Dedicated account manager",
      ],
    },
  ];

  const stats = [
    { number: "200+", label: "Countries Covered" },
    { number: "50M+", label: "Trade Records" },
    { number: "10K+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ExportAI
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                About
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition">
                <a href="/account/signin">Sign In</a>
              </button>
              {!loading && !user ? (
                <a
                  href="/account/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Get Started
                </a>
              ) : user ? (
                <a
                  href="/dashboard"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Dashboard
                </a>
              ) : null}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a
                href="#features"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Pricing
              </a>
              <a
                href="/account/signin"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🚀 Powered by AI & Global Trade Data
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Discover Global Markets,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Find Buyers Instantly
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-lg">
                ExportAI combines AI-powered market analysis with 200+
                countries' trade data. Identify opportunities, find buyers, and
                automate your export strategy—all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!loading && !user ? (
                  <a
                    href="/account/signup"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 hover:scale-105 duration-300"
                  >
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </a>
                ) : user ? (
                  <a
                    href="/dashboard"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 hover:scale-105 duration-300"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </a>
                ) : null}
                <a
                  href="#features"
                  className="px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition flex items-center justify-center gap-2"
                >
                  Learn More
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Animated Demo */}
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-10"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6 shadow-2xl h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto animate-pulse flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold">
                    AI Trade Intelligence Platform
                  </p>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Analyzing global markets in real-time...
                  </p>
                  <div className="flex gap-1 justify-center pt-2">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for Export Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find markets, identify buyers, and manage
              your export business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition duration-300 group hover:border-blue-500 border border-transparent"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Flexible Plans for Every Stage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan to power your export business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-8 transition duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-105"
                    : "bg-white border-2 border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={
                        plan.highlighted ? "text-blue-100" : "text-gray-600"
                      }
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mb-6 ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}
                >
                  {plan.description}
                </p>

                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-6 transition ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                  }`}
                >
                  Get Started
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-green-500"}`}
                      />
                      <span
                        className={
                          plan.highlighted ? "text-white" : "text-gray-700"
                        }
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                About ExportAI
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                ExportAI is the world's most comprehensive trade intelligence
                platform, designed specifically for exporters, importers, and
                trade professionals who need accurate, real-time market data.
              </p>
              <p className="text-gray-600 mb-6">
                Founded by trade experts and powered by cutting-edge AI
                technology, we've helped thousands of businesses identify new
                opportunities, connect with buyers, and optimize their
                international trade strategies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">
                    Real-time trade data from 200+ countries
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">
                    AI-powered market analysis and predictions
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">
                    Comprehensive buyer and supplier databases
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">
                    Automated campaign and outreach tools
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">50M+</div>
                    <div className="text-blue-100 text-sm">
                      Trade Records Analyzed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">200+</div>
                    <div className="text-blue-100 text-sm">
                      Countries Covered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">10K+</div>
                    <div className="text-blue-100 text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-blue-100 text-sm">Platform Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Export Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of exporters using ExportAI to find buyers and grow
            internationally
          </p>

          {!loading && !user ? (
            <a
              href="/account/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-xl transition hover:scale-105 duration-300 flex items-center gap-2 justify-center"
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </a>
          ) : user ? (
            <a
              href="/dashboard"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-xl transition hover:scale-105 duration-300 flex items-center gap-2 justify-center"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </a>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">ExportAI</span>
              </div>
              <p className="text-sm">
                Global trade intelligence platform powered by AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 ExportAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
