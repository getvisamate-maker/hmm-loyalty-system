"use client";

import { useState } from "react";
import { approvePartner, toggleCafeStatus, deleteCafe, deleteUser, updateCafePlan, createReferralCode } from "./actions";
import { Check, X, Shield, ToggleLeft, ToggleRight, Loader2, Trash2, ArrowUpCircle, Plus } from "lucide-react";

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
