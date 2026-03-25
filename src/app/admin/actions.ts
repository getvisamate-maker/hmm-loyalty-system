"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function togglePartnerStatus(userId: string, newStatus: boolean) {
  // Service Role Key is required to bypass RLS and update other users' profiles
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, message: "Server configuration error: Missing Admin Key" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase
    .from("profiles")
    .update({ 
      is_partner: newStatus,
      // If we are approving them, we should also set their 'role' to 'owner' so it reflects in the UI cleanly 
      // If un-approving, we can set back to 'customer'
      role: newStatus ? 'owner' : 'customer'
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating partner status:", error);
    return { success: false, message: "Failed to update status" };
  }

  revalidatePath("/admin");
  return { success: true };
}
