"use client";

import { useState } from "react";
import { approvePartner, toggleCafeStatus, deleteCafe, deleteUser, updateCafePlan, createReferralCode } from "./actions";
import { Check, X, Shield, ToggleLeft, ToggleRight, Loader2, Trash2, ArrowUpCircle, Plus, ChevronDown, ChevronRight, Mail, MapPin, Store } from "lucide-react";

export function CafeRow({ cafe }: { cafe: Record<string, any> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-zinc-800/30 transition-all cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-zinc-500 group-hover:text-indigo-400 transition-colors">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div>
              <p className="font-bold text-white text-base">{cafe.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <a href={`/c/${cafe.slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-400 hover:underline font-mono">
                  /c/{cafe.slug}
                </a>
                {cafe.location && <span className="text-xs text-zinc-500 border-l border-zinc-700 pl-2">{cafe.location}</span>}
              </div>
              {cafe.affiliate_id && (
                <span className="inline-block mt-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Referred
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
          <PlanSelector cafeId={cafe.id} currentPlan={cafe.plan_level || 'standard'} />
        </td>
        <td className="px-6 py-4 align-top">
          <div className="space-y-1">
             <div className="text-xs"><span className="text-zinc-500">Stamps Reqd:</span> <span className="text-white font-mono">{cafe.stamps_required}</span></div>
             <div className="text-xs"><span className="text-zinc-500">Owner:</span> <span className="text-white font-mono" title={cafe.owner_id}>{cafe.owner_id.substring(0,6)}...</span></div>
          </div>
        </td>
        <td className="px-6 py-4 text-right align-top" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end items-center gap-3">
            <CafeStatusToggle cafeId={cafe.id} initialStatus={cafe.status || 'active'} />
            <DeleteCafeButton cafeId={cafe.id} />
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-zinc-900/40 border-b border-zinc-800">
          <td colSpan={4} className="px-10 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                  <Store size={14} /> Cafe Settings
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex justify-between"><span className="text-zinc-500">ID:</span> <span className="font-mono text-xs text-white">{cafe.id}</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Slug:</span> <span className="text-white">{cafe.slug}</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Created At:</span> <span className="text-white">{new Date(cafe.created_at).toISOString().split('T')[0]}</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Stamps Required:</span> <span className="text-white">{cafe.stamps_required}</span></li>
                </ul>
              </div>

              <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                  <MapPin size={14} /> Location & Owner
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex flex-col"><span className="text-zinc-500 mb-1">Owner ID:</span> <span className="font-mono text-xs text-white break-all">{cafe.owner_id}</span></li>
                  <li className="flex flex-col"><span className="text-zinc-500 mb-1">Address/Location:</span> <span className="text-white">{cafe.location || 'No location provided'}</span></li>
                </ul>
              </div>

              <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                  <Shield size={14} /> Stripe & System
                </h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex flex-col"><span className="text-zinc-500 mb-1">Stripe Customer ID:</span> <span className="font-mono text-xs text-white break-all">{cafe.stripe_customer_id || 'None'}</span></li>
                  <li className="flex flex-col"><span className="text-zinc-500 mb-1">Stripe Subscription:</span> <span className="font-mono text-xs text-white break-all">{cafe.stripe_subscription_id || 'None'}</span></li>
                  <li className="flex justify-between mt-2 pt-2 border-t border-zinc-700/50">
                    <span className="text-zinc-500">Affiliate ID:</span> 
                    <span className="font-mono text-xs text-white">{cafe.affiliate_id ? cafe.affiliate_id.substring(0,8)+'...' : 'None'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function UserRow({ u }: { u: Record<string, any> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-zinc-800/30 transition-all cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4">
          <div className="flex items-start gap-3">
             <div className="mt-2 text-zinc-500 group-hover:text-blue-400 transition-colors">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 border border-zinc-700 shrink-0">
               {u.full_name ? u.full_name[0].toUpperCase() : u.email?.[0].toUpperCase() || '?'}
            </div>
            <div>
               <div className="font-bold text-white">{u.full_name || "Anonymous User"}</div>
               <div className="text-xs text-zinc-500 font-mono mt-0.5">{u.email}</div>
               {u.marketing_consent && (
                  <span className="inline-block mt-2 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Consented to Marketing</span>
               )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 align-middle">
          <div className="flex flex-col gap-2 items-start">
             <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide border shadow-sm ${
                u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                u.role === 'cafe_owner' || u.is_partner ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
             }`}>
                {u.role === 'super_admin' ? 'Super Admin' : u.is_partner ? 'Cafe Owner' : u.role || 'Customer'}
             </span>
             {u.requested_role && !u.is_partner && u.requested_role !== 'customer' && (
               <span className="text-[10px] text-amber-500 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded">
                 Requested: {u.requested_role}
               </span>
             )}
          </div>
        </td>
        <td className="px-6 py-4 text-xs text-zinc-500 align-middle">
          <div><span className="text-zinc-600">Joined:</span> {new Date(u.created_at).toISOString().split('T')[0]}</div>
          <div className="mt-1 font-mono text-[10px]">{u.id.substring(0,8)}...</div>
        </td>
        <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end gap-2">
            <DeleteUserButton userId={u.id} />
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-zinc-900/40 border-b border-zinc-800">
          <td colSpan={4} className="px-10 py-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <h4 className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                    <Mail size={14} /> Contact Profile
                  </h4>
                  <ul className="space-y-2 text-zinc-400">
                    <li className="flex justify-between"><span className="text-zinc-500">ID:</span> <span className="font-mono text-xs text-white">{u.id}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Full Name:</span> <span className="text-white">{u.full_name || 'N/A'}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="text-white">{u.email || 'N/A'}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Marketing Consent:</span> <span className="text-white">{u.marketing_consent ? 'Yes' : 'No'}</span></li>
                  </ul>
                </div>

                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <h4 className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                    <Shield size={14} /> Permissions & System
                  </h4>
                  <ul className="space-y-2 text-zinc-400">
                    <li className="flex justify-between"><span className="text-zinc-500">Created At:</span> <span className="text-white">{new Date(u.created_at).toISOString().split('T')[0]}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Current Role:</span> <span className="text-white">{u.role || 'customer'}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Partner Flag:</span> <span className="text-white">{u.is_partner ? 'True' : 'False'}</span></li>
                    <li className="flex justify-between"><span className="text-zinc-500">Requested Role:</span> <span className="text-white">{u.requested_role || 'None'}</span></li>
                  </ul>
                </div>
             </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function AffiliateRow({ aff }: { aff: Record<string, any> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-zinc-800/30 transition-all cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4">
          <div className="flex items-start gap-3">
             <div className="mt-1 text-zinc-500 group-hover:text-emerald-400 transition-colors">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div>
              <div className="font-bold text-white text-base">{aff.referrer?.full_name || "Unknown Identity"}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{aff.referrer?.email || "No email linked"}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1">
            {aff.codes.map((code: string) => (
                <div key={code} className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded-lg group-hover:border-emerald-500/50 transition-colors w-max">
                  <span className="font-mono text-emerald-400 font-bold tracking-widest">{code}</span>
                </div>
            ))}
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">Created: {new Date(aff.created_at).toISOString().split('T')[0]}</div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-white font-bold border border-zinc-700">
            {aff.active_count}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <span className="text-lg text-zinc-300">${aff.monthly_revenue.toFixed(2)}</span>
          <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">/ month</span>
        </td>
        <td className="px-6 py-4 text-right align-top">
          <span className="text-xl font-black text-emerald-400">${aff.revenue_share.toFixed(2)}</span>
          <span className="block text-[10px] text-emerald-500/50 uppercase tracking-widest">20% cut</span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-zinc-900/40 border-b border-zinc-800">
          <td colSpan={5} className="px-10 py-6">
             <div className="bg-zinc-800/30 p-5 rounded-xl border border-zinc-800">
               <h4 className="font-bold text-zinc-300 mb-4 flex items-center gap-2">
                 <Store size={14} /> Referred Cafes
               </h4>
               {aff.their_cafes && aff.their_cafes.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {aff.their_cafes.map((c: Record<string, any>) => (
                     <div key={c.id} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-white">{c.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-1">Plan: {c.plan_level || 'standard'}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${c.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                          {c.status || 'inactive'}
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-zinc-500 italic">This affiliate has not referred any cafes yet.</p>
               )}
             </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CafeStatusToggle({ cafeId, initialStatus }: { cafeId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    // Optimistic update
    const newStatus = status === 'active' ? 'suspended' : 'active';
    setStatus(newStatus);
    
    // Server action
    const result = await toggleCafeStatus(cafeId, status);
    
    if (!result.success) {
      // Revert if failed
      setStatus(status);
      alert("Failed to update status");
    }
    setLoading(false);
  };

  const isActive = status === 'active';

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        isActive 
          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : (isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />)}
      {isActive ? "Active" : "Suspended"}
    </button>
  );
}

export function ApprovePartnerButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this partner?")) return;
    
    setLoading(true);
    const result = await approvePartner(userId);
    setLoading(false);
    
    if (result.success) {
      setApproved(true);
    } else {
      alert("Failed to approve partner");
    }
  };

  if (approved) {
     return <span className="text-green-500 flex items-center gap-1 text-sm font-medium"><Check size={14} /> Approved</span>;
  }

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
      Approve
    </button>
  );
}

export function DeleteCafeButton({ cafeId }: { cafeId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this cafe? All data will be lost.")) return;
    
    setLoading(true);
    const result = await deleteCafe(cafeId);
    setLoading(false);
    
    if (!result.success) {
      alert("Failed to delete cafe");
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
      title="Delete Cafe"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user?")) return;
    
    setLoading(true);
    const result = await deleteUser(userId);
    setLoading(false);
    
    if (!result.success) {
      alert("Failed to delete user");
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
      title="Delete User"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

export function PlanSelector({ cafeId, currentPlan }: { cafeId: string, currentPlan: string }) {
  const [plan, setPlan] = useState(currentPlan || 'standard');
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlan = e.target.value;
    setPlan(newPlan);
    setLoading(true);
    
    const result = await updateCafePlan(cafeId, newPlan);
    
    if (!result.success) {
      alert("Failed to update plan");
      setPlan(currentPlan); // Revert
    }
    setLoading(false);
  };

  const getPlanColor = (p: string) => {
    switch (p) {
      case 'pro': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'growth': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="relative">
      <select
        value={plan}
        onChange={handleChange}
        disabled={loading}
        className={`appearance-none pl-3 pr-8 py-1 rounded text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer transition-colors ${getPlanColor(plan)}`}
      >
        <option value="standard">Standard</option>
        <option value="growth">Growth</option>
        <option value="pro">Pro</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        {loading ? <Loader2 size={10} className="animate-spin" /> : <ArrowUpCircle size={10} />}
      </div>
    </div>
  );
}

export function CreateReferralCodeForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await createReferralCode(email, code);

    if (result.success) {
      setMessage("Success!");
      setEmail("");
      setCode("");
    } else {
      setMessage(result.message || "Failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User Email"
          required
          className="flex-1 bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm text-white"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="New Code (e.g. SARAH20)"
          required
          className="flex-1 bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm text-white uppercase font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white text-sm font-bold flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          Create
        </button>
      </div>
      {message && <p className={`text-xs ${message === "Success!" ? "text-green-400" : "text-red-400"}`}>{message}</p>}
    </form>
  );
}
