"use client";

import { useState } from "react";
import { approvePartner, toggleCafeStatus, deleteCafe, deleteUser } from "./actions";
import { Check, X, Shield, ToggleLeft, ToggleRight, Loader2, Trash2 } from "lucide-react";

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
