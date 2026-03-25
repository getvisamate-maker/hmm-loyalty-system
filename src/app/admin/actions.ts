"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const getAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Server configuration error: Missing Admin Key");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
};

export async function approvePartner(userId: string) {
  try {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({ 
        role: 'cafe_owner',
        requested_role: null // Clear request so they don't show up again
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error approving partner:", error);
    return { success: false, message: "Failed to approve partner" };
  }
}

export async function toggleCafeStatus(cafeId: string, currentStatus: string) {
  try {
    const supabase = getAdminClient();
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

    const { error } = await supabase
      .from("cafes")
      .update({ status: newStatus })
      .eq("id", cafeId);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error toggling cafe status:", error);
    return { success: false, message: "Failed to update cafe status" };
  }
}

export async function deleteCafe(cafeId: string) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("cafes").delete().eq("id", cafeId);
    if (error) throw error;
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting cafe:", error);
    return { success: false, message: "Failed to delete cafe" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = getAdminClient();
    // Delete from auth.users requires admin API too, but usually cascading deletes handles profiles
    // However, supabase-js admin client can delete users
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}
