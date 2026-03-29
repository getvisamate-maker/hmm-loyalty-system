"use client";

import { useState } from "react";
import { Check, Send, Sparkles, LayoutTemplate, Clock, MessageSquare, Mail, FileText, Download, QrCode, Instagram, Image as ImageIcon } from "lucide-react";
import { createPromotion } from "./actions";
import { downloadMarketingAsset } from "./template-generator";

const TEMPLATES = [
  {
    id: "announcement",
    name: "News & Update",
    subject: "Big news from [Cafe Name]! ☕️",
    headline: "We're launching something new!",
    body: "Hey there! We wanted you to be the first to know about our new seasonal menu. Stop by this week to try it out.",
    icon: MessageSquare
  },
  {
    id: "we_miss_you",
    name: "We Miss You",
    subject: "It's been a while... Here's 50% off! 🎁",
    headline: "We've missed seeing you!",
    body: "It's been a few weeks since your last visit. Come back in this week and show this email for 50% off any drink on the menu.",
    icon: Clock
  },
  {
    id: "flash_sale",
    name: "Flash Sale",
    subject: "Today Only: Double Stamps! 🌟",
    headline: "Double Stamp Tuesday!",
    body: "Scan your digital loyalty card anytime today and receive TWO stamps instead of one. Get closer to that free coffee!",
    icon: Sparkles
  }
];

export function CampaignForm({ cafeId, audienceCount, cafeName = "Your Cafe" }: { cafeId: string, audienceCount: number, cafeName?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [subject, setSubject] = useState(TEMPLATES[0].subject.replace("[Cafe Name]", cafeName));
  const [headline, setHeadline] = useState(TEMPLATES[0].headline);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("mobile");
  
  const handleDownload = async (type: string) => {
    // Show UI toast visual cue immediately
    const toast = document.createElement("div");
    toast.className = "fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold animate-in fade-in slide-in-from-bottom-4 z-50 flex items-center gap-3";
    toast.innerHTML = `<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Generating high-res ${type.replace(/_/g, ' ')}...`;
    document.body.appendChild(toast);
    
    try {
        await downloadMarketingAsset(type, cafeName || "Your Cafe");
        toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Download Complete!`;
        toast.classList.replace("bg-indigo-600", "bg-emerald-600");
    } catch (e) {
        toast.innerHTML = `Error generating asset`;
        toast.classList.replace("bg-indigo-600", "bg-red-600");
    }

    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-500");
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 4000);
  };

  const handleTemplateClick = (t: typeof TEMPLATES[0]) => {
    setActiveTemplate(t);
    setSubject(t.subject.replace("[Cafe Name]", cafeName));
    setHeadline(t.headline);
    setBody(t.body);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body || audienceCount === 0) return;
    
    setStatus("loading");
    
    try {
      await createPromotion(cafeId, subject, body);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSubject("");
        setHeadline("");
        setBody("");
      }, 4000);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Failed to send campaign. Please try again.");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <LayoutTemplate size={16} className="text-indigo-500" />
            Grow With Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => {
              const Icon = t.icon;
              const isActive = activeTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateClick(t)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-300 dark:hover:border-indigo-800"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400 mb-2" : "text-zinc-400 mb-2"} />
                  <p className={`font-bold text-sm ${isActive ? "text-indigo-900 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                    {t.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <form id="campaign-form" onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Email Subject</label>
            <input 
              type="text" 
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Email Headline</label>
            <input 
              type="text" 
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm font-bold"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Message Body</label>
            <textarea 
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm resize-none h-32 leading-relaxed"
            />
          </div>
          
          <div className="pt-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-t border-zinc-200 dark:border-zinc-800 mt-6">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Mail size={12} />
              Sends from <strong className="text-zinc-700 dark:text-zinc-300">hello@hmmloyalty.com</strong>
            </p>
            <button 
              type="submit"
              disabled={status !== "idle" || audienceCount === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl text-sm font-bold w-full md:w-fit disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {status === "idle" && <><Send size={16} /> Send to {audienceCount} {audienceCount === 1 ? 'Customer' : 'Customers'}</>}
              {status === "loading" && (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Sending...</>
              )}
              {status === "success" && <><Check size={16} /> Successfully Sent!</>}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full xl:w-[400px] flex-shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
            Marketing Toolkit
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            Grow your audience faster with these ready-to-use promotional assets. Download and print these for your physical space, or post them on your social media.
          </p>
          
          <div className="space-y-3">
            <button type="button" onClick={() => handleDownload("A4_Window_Poster.pdf")} className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileText size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">A4 Window Poster</h4>
                  <p className="text-xs text-zinc-500">PDF • Print ready</p>
                </div>
              </div>
              <Download size={16} className="text-zinc-400 group-hover:text-indigo-500" />
            </button>

            <button type="button" onClick={() => handleDownload("Table_Tent_Cards.pdf")} className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <QrCode size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Table Tent Cards</h4>
                  <p className="text-xs text-zinc-500">PDF • Contains QR Code</p>
                </div>
              </div>
              <Download size={16} className="text-zinc-400 group-hover:text-emerald-500" />
            </button>

            <button type="button" onClick={() => handleDownload("Instagram_Post.png")} className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Instagram size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Instagram Post</h4>
                  <p className="text-xs text-zinc-500">PNG • 1080x1080px</p>
                </div>
              </div>
              <Download size={16} className="text-zinc-400 group-hover:text-pink-500" />
            </button>
            
            <button type="button" onClick={() => handleDownload("Instagram_Story.png")} className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <ImageIcon size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Instagram Story</h4>
                  <p className="text-xs text-zinc-500">PNG • 1080x1920px</p>
                </div>
              </div>
              <Download size={16} className="text-zinc-400 group-hover:text-orange-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
