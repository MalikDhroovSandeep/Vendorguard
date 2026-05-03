'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll reveal effect
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-[#f6f7f8] dark:bg-[#0B1116] font-[var(--font-manrope)] text-[#0e141b] antialiased overflow-x-hidden selection:bg-[#43766c] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e7edf3] bg-white/90 backdrop-blur-md dark:bg-[#0B1116]/80 dark:border-gray-800">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#43766c]/10 flex items-center justify-center text-[#43766c] dark:text-[#2dd4bf] dark:bg-[#2dd4bf]/10">
              <span className="material-symbols-outlined">shield_lock</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0e141b] dark:text-white">VendorGuard</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#roles" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Roles</a>
            <a href="#contact" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Contact</a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-[#0e141b] hover:text-[#43766c] dark:text-gray-300 dark:hover:text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-[#43766c] hover:bg-[#2d524b] text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors shadow-sm dark:shadow-none">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-[#0B1116] px-6 py-4">
            <nav className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white text-sm font-medium py-2">Features</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white text-sm font-medium py-2">Roles</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white text-sm font-medium py-2">Contact</a>
              <hr className="border-gray-700" />
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-bold py-2">Login</Link>
              <Link href="/signup" className="bg-[#43766c] hover:bg-[#2d524b] text-white text-sm font-bold px-5 py-2 rounded-lg text-center">Sign Up</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 bg-white dark:bg-[#0B1116] overflow-hidden">
        {/* Decorative Elements - Left Side */}
        <div className="absolute left-0 top-0 w-1/3 h-full pointer-events-none hidden lg:block">
          <div className="absolute top-20 left-12 w-16 h-16 bg-[#43766c]/10 dark:bg-[#2dd4bf]/10 rounded-2xl flex items-center justify-center animate-float">
            <span className="material-symbols-outlined text-[#43766c] dark:text-[#2dd4bf] text-3xl">shield_lock</span>
          </div>
          <div className="absolute top-1/3 left-24 w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center animate-float-slow">
            <span className="material-symbols-outlined text-purple-400 text-2xl">analytics</span>
          </div>
          <div className="absolute bottom-32 left-16 w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center animate-float-reverse">
            <span className="material-symbols-outlined text-blue-400 text-2xl">verified_user</span>
          </div>
          <div className="absolute top-1/2 left-8 w-20 h-20 bg-gradient-to-br from-[#2dd4bf]/20 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-32 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Decorative Elements - Right Side */}
        <div className="absolute right-0 top-0 w-1/3 h-full pointer-events-none hidden lg:block">
          <div className="absolute top-24 right-16 w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center animate-float-slow">
            <span className="material-symbols-outlined text-orange-400 text-2xl">psychology</span>
          </div>
          <div className="absolute top-1/3 right-28 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center animate-float">
            <span className="material-symbols-outlined text-green-400 text-2xl">trending_up</span>
          </div>
          <div className="absolute bottom-28 right-12 w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center animate-float-reverse">
            <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
          </div>
          <div className="absolute top-20 right-8 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-1/3 right-24 w-28 h-28 bg-gradient-to-br from-[#2dd4bf]/15 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0e141b] dark:text-white">
              AI-Driven Vendor Reliability &amp; Risk Scoring System
            </h1>
            <p className="text-lg text-[#4e7397] dark:text-gray-400 leading-relaxed">
              A centralized platform for vendor onboarding, KYC verification, procurement tracking, and AI-based risk analysis designed to streamline enterprise operations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link href="/signup" className="bg-[#43766c] hover:bg-[#2d524b] text-white text-base font-bold px-8 py-3 rounded-lg shadow-lg shadow-gray-400/20 dark:shadow-none transition-all transform hover:-translate-y-0.5">
                Get Started
              </Link>
              <Link href="/login" className="bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-base font-bold px-8 py-3 rounded-lg transition-all">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#f6f7f8] dark:bg-[#121a23] border-t border-[#e7edf3] dark:border-gray-800" id="features">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-12 reveal">
            <h2 className="text-4xl font-bold text-[#0e141b] dark:text-white">Key System Features</h2>
            <p className="text-[#4e7397] dark:text-gray-400 mt-2">Core modules designed for comprehensive vendor lifecycle management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
            {/* Feature Cards */}
            <FeatureCard icon="verified_user" title="Vendor Onboarding & KYC" description="Streamlined verification process with automated document checks and identity validation." />
            <FeatureCard icon="admin_panel_settings" title="Role-Based Access Control" description="Granular permission settings securing data access for Admins, Internal Users, and Vendors." />
            <FeatureCard icon="receipt_long" title="PO & Invoice Tracking" description="Real-time tracking of procurement lifecycles, purchase orders, and payment statuses." />
            <FeatureCard icon="gavel" title="Dispute Management" description="Centralized resolution system for logging and resolving discrepancies effectively." />
            <FeatureCard icon="psychology" title="AI Risk Scoring" description="Machine learning models that analyze historical data to assess vendor reliability scores." />
            <FeatureCard icon="monitoring" title="Analytics Dashboard" description="Comprehensive reporting tools providing actionable insights into procurement performance." />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-white dark:bg-[#0B1116]" id="roles">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-12 reveal">
            <h2 className="text-4xl font-bold text-[#0e141b] dark:text-white">Who Uses VendorGuard?</h2>
            <p className="text-[#4e7397] dark:text-gray-400 mt-2">Tailored access for every role in your organization.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
            <RoleCard
              icon="manage_accounts"
              title="System Admin"
              color="purple"
              features={[
                "Complete system configuration and user management.",
                "Define risk parameters and approve high-risk vendors.",
                "Access to full audit logs and system health reports."
              ]}
            />
            <RoleCard
              icon="badge"
              title="Internal User"
              color="blue"
              features={[
                "Raise purchase orders and track requisition status.",
                "Review vendor performance and submit feedback.",
                "View approved vendor lists and risk scores."
              ]}
            />
            <RoleCard
              icon="storefront"
              title="Vendor"
              color="green"
              features={[
                "Self-service profile updates and KYC document upload.",
                "Submit invoices and track payment status in real-time.",
                "Respond to disputes or queries raised by the organization."
              ]}
            />
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="py-24 bg-[#f6f7f8] dark:bg-[#121a23] border-t border-[#e7edf3] dark:border-gray-800">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-20 max-w-2xl mx-auto reveal">
            <span className="text-[#43766c] dark:text-[#2dd4bf] font-bold tracking-wide uppercase text-sm">Powered by Intelligence</span>
            <h2 className="text-4xl font-bold text-[#0e141b] dark:text-white mt-2">AI-Driven Insights</h2>
            <p className="text-[#4e7397] dark:text-gray-400 mt-2">Leveraging advanced algorithms to predict risks before they impact your supply chain.</p>
          </div>

          <div className="max-w-[1100px] mx-auto flex flex-col gap-24">
            {/* Risk Scoring Engine */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="text-left">
                <h3 className="text-3xl font-bold text-[#0e141b] dark:text-white mb-4">Vendor Risk Scoring Engine</h3>
                <p className="text-lg text-[#4e7397] dark:text-gray-400 leading-relaxed mb-6">Dynamically calculates risk scores (0-100) based on financial stability, delivery times, and compliance history, providing an instant snapshot of vendor reliability.</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#2dd4bf] rounded-full"></span>Real-time financial data integration</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#2dd4bf] rounded-full"></span>Historical compliance tracking</li>
                </ul>
              </div>
              <div className="relative group">
                <RiskScoreWidget />
              </div>
            </div>

            {/* Performance Prediction */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="order-2 md:order-1 relative group">
                <PerformanceChart />
              </div>
              <div className="order-1 md:order-2 text-left">
                <h3 className="text-3xl font-bold text-[#0e141b] dark:text-white mb-4">Performance Prediction</h3>
                <p className="text-lg text-[#4e7397] dark:text-gray-400 leading-relaxed">Forecasts potential delays or quality issues using historical trend analysis and market data to help procurement teams make proactive decisions.</p>
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="text-left">
                <h3 className="text-3xl font-bold text-[#0e141b] dark:text-white mb-4">Anomaly &amp; Pattern Detection</h3>
                <p className="text-lg text-[#4e7397] dark:text-gray-400 leading-relaxed mb-6">Identifies irregular billing patterns, compliance deviations, or potential fraudulent activities through sophisticated deep learning models.</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 dark:text-red-400 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>High-risk pattern alerted automatically</span>
                </div>
              </div>
              <div className="relative group">
                <AnomalyChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#43766c] py-16">
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Smarter Vendor Management with AI</h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Access the prototype dashboard to see the risk scoring engine in action.
          </p>
          <Link href="/login" className="inline-block bg-white text-[#43766c] hover:bg-slate-50 text-base font-bold px-8 py-3 rounded-lg shadow-lg transition-colors">
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-[#0B1116] border-t border-[#e7edf3] dark:border-gray-800 pt-16 pb-8" id="contact">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#43766c] dark:text-[#2dd4bf]">shield_lock</span>
                <span className="text-lg font-bold text-[#0e141b] dark:text-white">VendorGuard</span>
              </div>
              <p className="text-sm text-[#4e7397] dark:text-gray-400 mb-4 leading-relaxed">
                An advanced solution for modern procurement teams to assess, monitor, and manage vendor relationships effectively.
              </p>
            </div>
            <div className="flex gap-12">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-[#0e141b] dark:text-white text-sm">Platform</h4>
                <a className="text-sm text-[#4e7397] dark:text-gray-400 hover:text-[#43766c] dark:hover:text-[#2dd4bf]" href="#features">Features</a>
                <a className="text-sm text-[#4e7397] dark:text-gray-400 hover:text-[#43766c] dark:hover:text-[#2dd4bf]" href="#">Risk Models</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-[#0e141b] dark:text-white text-sm">Contact</h4>
                <a className="text-sm text-[#4e7397] dark:text-gray-400 hover:text-[#43766c] dark:hover:text-[#2dd4bf]" href="#">Project Team</a>
                <a className="text-sm text-[#4e7397] dark:text-gray-400 hover:text-[#43766c] dark:hover:text-[#2dd4bf]" href="#">Documentation</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e7edf3] dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© 2025 VendorGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#43766c] hover:bg-[#2d524b] text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <span className="material-symbols-outlined">keyboard_arrow_up</span>
        </button>
      )}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group bg-white dark:bg-gray-800/60 p-6 rounded-xl border border-[#e7edf3] dark:border-gray-700 hover:shadow-lg dark:hover:bg-gray-800 transition-all">
      <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-[#43766c] dark:text-[#2dd4bf] mb-4 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-[#0e141b] dark:text-white mb-2">{title}</h3>
      <p className="text-[#4e7397] dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Role Card Component
function RoleCard({ icon, title, color, features }: { icon: string; title: string; color: string; features: string[] }) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
  };

  return (
    <div className="flex flex-col h-full border border-[#e7edf3] dark:border-gray-700 rounded-xl p-8 bg-slate-50 dark:bg-[#121a23]">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-[#0e141b] dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-4 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-[#4e7397] dark:text-gray-300">
            <span className="material-symbols-outlined text-[#43766c] dark:text-[#2dd4bf] text-[20px] shrink-0">check_circle</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Risk Score Widget Component
// Risk Score Widget Component
function RiskScoreWidget() {
  const [score, setScore] = useState(76);

  useEffect(() => {
    // Generate a random score between 60 and 99 on mount
    const randomScore = Math.floor(Math.random() * (99 - 60 + 1)) + 60;
    setScore(randomScore);
  }, []);

  // Calculate stroke offset based on score (radius = 40)
  // Circumference = 2 * PI * 40 ≈ 251.2
  const circumference = 251.2;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 flex items-center justify-center shadow-lg dark:shadow-slate-900/50">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle className="dark:stroke-slate-700 stroke-gray-200" cx="50" cy="50" fill="transparent" r="40" stroke="#1e293b" strokeWidth="8" />
          <circle
            className="drop-shadow-[0_0_4px_rgba(45,212,191,0.5)] transition-all duration-1000 ease-out"
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="#2dd4bf"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-[#0e141b] dark:text-white tracking-tighter transition-all duration-1000">{score}</span>
          <span className="text-xs text-[#43766c] dark:text-[#2dd4bf] uppercase tracking-widest font-bold mt-2 border border-[#43766c] dark:border-[#2dd4bf] px-2 py-0.5 rounded-full">
            {score >= 80 ? 'Low Risk' : score >= 60 ? 'Medium Risk' : 'High Risk'}
          </span>
        </div>
        <div className="absolute -bottom-4 w-full text-center">
          <span className="text-xs text-gray-400">Updated: Just now</span>
        </div>
      </div>
    </div>
  );
}

// Performance Chart Component
function PerformanceChart() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-video bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 flex flex-col justify-end shadow-lg dark:shadow-slate-900/50">
      <div className="absolute top-6 left-6 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Historical Perf.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2dd4bf]"></span>
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">AI Forecast</span>
        </div>
      </div>
      <div className="w-full h-40 flex items-end gap-1 mt-8">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
          <line className="opacity-30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="300" y1="30" y2="30" />
          <line className="opacity-30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="300" y1="60" y2="60" />
          <line className="opacity-30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="300" y1="90" y2="90" />
          <path d="M0,90 C30,85 50,100 80,70 S120,60 160,55" fill="none" stroke="#6366f1" strokeLinecap="round" strokeWidth="3" />
          <defs>
            <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M0,90 C30,85 50,100 80,70 S120,60 160,55 V120 H0 Z" fill="url(#grad1)" stroke="none" />
          <path d="M160,55 C200,50 240,30 300,20" fill="none" stroke="#2dd4bf" strokeDasharray="6 4" strokeLinecap="round" strokeWidth="3" />
          <circle className="animate-pulse shadow-[0_0_10px_#2dd4bf]" cx="300" cy="20" fill="#2dd4bf" r="5" />
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
        <span>Q1</span>
        <span>Q2</span>
        <span>Q3 (Proj)</span>
      </div>
    </div>
  );
}

// Anomaly Chart Component
function AnomalyChart() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square md:aspect-[4/3] bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 flex flex-col justify-center shadow-lg dark:shadow-slate-900/50">
      <div className="w-full h-full flex items-end justify-between gap-2 px-2 pb-2 border-b border-gray-200 dark:border-slate-600">
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[40%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[35%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[50%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[45%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[40%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-red-500 h-[85%] rounded-t-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] relative cursor-help">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Anomaly Detected
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
          </div>
        </div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[42%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[38%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
        <div className="w-1/12 bg-slate-200 dark:bg-slate-700 h-[45%] rounded-t-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"></div>
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-slate-500 font-mono uppercase">
        <span>T-001</span>
        <span>Transaction ID</span>
        <span>T-010</span>
      </div>
    </div>
  );
}
