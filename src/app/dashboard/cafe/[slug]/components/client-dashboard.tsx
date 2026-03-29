"use client";

import { useState } from "react";
import { 
  BarChart, Users, Megaphone, Settings,
  ImageIcon, Shield, Lock, TrendingUp,
  Award, Coffee as CoffeeIcon, UsersRound, Zap, CreditCard, Activity
} from "lucide-react";
import Link from "next/link";
import { BusinessFlowChart } from "../flow-chart";
import { CafeSettingsForm } from "../settings-form";
import { LogoUpload } from "../logo-upload";
import { CampaignForm } from "../campaign-form";
import { QrCodeGenerator } from "../qr-generator";

type FeatureLockProps = {
  isLocked: boolean;
  title: string;
  description: string;
  planLevel: string;
  children: React.ReactNode;
};

const PremiumLock = ({ isLocked, title, description, planLevel, children }: FeatureLockProps) => {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative group rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center p-8 text-center transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20 transform group-hover:scale-110 transition-transform">
          <Lock className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-zinc-800 dark:text-zinc-200 font-bold mb-8 max-w-md leading-relaxed">
          {description}
        </p>
        <Link href="billing" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-2xl">
          <Zap size={18} className="fill-current" />
          Upgrade to {planLevel}
        </Link>
      </div>
      <div className="pointer-events-none select-none transition-all duration-500">
        {children}
      </div>
    </div>
  );
};

const TrialLock = ({ isExpired, children }: { isExpired: boolean, children: React.ReactNode }) => {
  if (!isExpired) return <>{children}</>;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden min-h-[500px]">
      <div className="absolute inset-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-[50] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30">
          <Lock className="text-white w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
          Trial Expired 😓 
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-8 max-w-lg text-lg">
          Your 14-day free trial has ended. To continue using your loyalty program and keep your customers engaged, please choose a plan.
        </p>
        <Link href="billing" className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white hover:scale-105 active:scale-95 transition-all px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-red-500/20">
          <CreditCard size={20} />
          Choose a Plan
        </Link>
      </div>
      <div className="pointer-events-none select-none blur-sm opacity-50 transition-all duration-500">
        {children}
      </div>
    </div>
  );
};

export default function ModernCafeDashboard({ 
  cafe, stats, dailyFlowArray, recentLogs, publicUrl, plan, isGrowthOrHigher, isPro, isTrialExpired
}: any) {
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart },
    { id: "loyalty", label: "Loyalty System", icon: UsersRound },
    { id: "settings", label: "Settings & Brand", icon: Settings },
    { id: "marketing", label: "Marketing Suite", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-24 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors font-medium">
                &larr; Back to Dashboard
              </Link>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-widest">
                {plan} Plan
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
              {cafe.name}
            </h1>
          </div>
          <Link href={`/dashboard/cafe/${cafe.slug}/billing`} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95">
            <Zap size={18} className="text-white fill-white" /> Upgrade Plan
          </Link>
        </div>

        <TrialLock isExpired={isTrialExpired}>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* LEFT COLUMN - CONTENT */}
            <div className="lg:col-span-8 space-y-6">

              {/* TABS NAVIGATION */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
                          <UsersRound size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Total Customers</p>
                          <h3 className="text-3xl font-black">{stats.totalCustomers}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center">
                          <Award size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Stamps Issued</p>
                          <h3 className="text-3xl font-black">{stats.totalStampsReal}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Store Traffic (30 Days)</h3>
                      <span className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-300">
                        {stats.currentMonthCount} Scans this month
                      </span>
                    </div>
                    <BusinessFlowChart data={dailyFlowArray.map(([day, count]: any) => ({ day, count }))} />
                  </div>
                </div>
              )}

              {/* LOYALTY SYSTEM TAB */}
              {activeTab === "loyalty" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                       <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                       </span>
                       Live Member Activity
                    </h3>
                    
                    {recentLogs.length > 0 ? (
                      <div className="space-y-4">
                        {recentLogs.map((log: any, i: number) => (
                          <div key={i} className="flex gap-4">
                            <div className="mt-1">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <CoffeeIcon size={14} />
                              </div>
                            </div>
                            <div className="flex-1 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                              <p className="font-bold text-zinc-900 dark:text-white text-sm">
                                {log.loyalty_cards?.profiles?.full_name || "A customer"}
                              </p>
                              <p suppressHydrationWarning className="text-xs text-zinc-500 mt-1">
                                {new Date(log.created_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
                        <Activity className="mx-auto mb-3 opacity-50" size={32} />
                        <p>No scans yet. Put your QR code on the counter!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MARKETING TAB */}
              {activeTab === "marketing" && (
                <div className="animate-in fade-in duration-500">
                  <PremiumLock
                    isLocked={!isGrowthOrHigher}
                    title="Unlock The Growth Engine"
                    description="Stop waiting for customers to come back. Upgrade to Growth to email promotions directly to your scanned audience."
                    planLevel="Growth"
                  >
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 text-white">
                          <Megaphone size={28} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Audience Lab</h2>
                          <p className="text-zinc-500 dark:text-zinc-400">
                            {stats.optedInCount} customers have opted-in to your marketing.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Send Campaign</h3>
                        <CampaignForm cafeId={cafe.id} audienceCount={stats.optedInCount || 0} />
                      </div>
                    </div>
                  </PremiumLock>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                       <Settings className="text-zinc-400" /> Cafe Configuration
                    </h2>
                    <CafeSettingsForm cafe={cafe} />
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                     <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                       <ImageIcon className="text-zinc-400" /> Brand Logo
                    </h2>
                    <LogoUpload cafeId={cafe.id} currentLogo={cafe.logo_url} />
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">

              {/* Counter Code Widget */}
              <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center shadow-sm sticky top-24">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Counter Native App</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                  Print this for your counter. Customers scan this to collect stamps instantly.
                </p>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 mb-6 w-full max-w-[220px] aspect-square flex items-center justify-center">
                  <QrCodeGenerator url={publicUrl} />
                </div>

                <div className="w-full space-y-4">
                  <Link 
                    href={`/dashboard/cafe/${cafe.slug}/pos`}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    <Shield size={18} /> Launch Secure Terminal
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Use this on a tablet behind the counter with your PIN code.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </TrialLock>

      </div>
    </div>
  );
}
