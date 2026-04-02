"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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
    
    // 1. Fetch user to get email before updating
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const userEmail = user?.email;

    const { error } = await supabase
      .from("profiles")
      .update({ 
        role: 'cafe_owner',
        is_partner: true, // Legacy boolean needed for RLS
        requested_role: null // Clear request so they don't show up again
      })
      .eq("id", userId);

    if (error) throw error;
    
    // 2. Send email if we found it
    if (userEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Hmm Loyalty <hello@hmmloyalty.com>',
        to: userEmail,
        subject: 'Your Hmm Loyalty Dashboard is Ready! 🎉',
        html: 'Hi there!<br><br>We saw that you recently signed up. We have just upgraded your account to give you <strong>full owner access</strong>!<br><br>You can now log in and access your cafe dashboard to start setting up your digital loyalty program, manage customers, and launch your growth features.<br><br><a href="https://hmmloyalty.com/dashboard">Access Your Dashboard</a><br><br>We are thrilled to have you onboard. If you have any questions, just reply to this email!<br><br>Best regards,<br>The Hmm Loyalty Team'
      });
    }

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

export async function updateCafePlan(cafeId: string, newPlan: string) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("cafes")
      .update({ plan_level: newPlan })
      .eq("id", cafeId);

    if (error) throw error;
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating cafe plan:", error);
    return { success: false, message: "Failed to update plan" };
  }
}

export async function createReferralCode(email: string, code: string) {
  try {
    const supabase = getAdminClient();
    
    // 1. Find user ID by email using Admin API (because profiles usually don't have email searchable)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Increase limit to find user
    });
    
    if (userError || !users) {
       console.error("Error listing users:", userError);
       return { success: false, message: "Failed to list users." };
    }

    const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    
    if (!targetUser) {
      return { success: false, message: "User not found with that email. Ask them to sign up first." };
    }
    
    const userId = targetUser.id;
    const cleanCode = code.toUpperCase().trim();

    // 2. Create Code
    const { error } = await supabase
      .from("referral_codes")
      .insert({
        referrer_id: userId,
        code: cleanCode
      });

    if (error) {
      if (error.code === '23505') return { success: false, message: "Code already exists." };
      throw error;
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error creating referral code:", error);
    return { success: false, message: "Failed to create code" };
  }
}
