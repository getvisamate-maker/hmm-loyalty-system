"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createCafe(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const stamps = parseInt(formData.get("stamps_required") as string);
  const pin = formData.get("pin_code") as string;
  const color = formData.get("brand_color") as string;
  
  // File handling
  const file = formData.get("logo") as File;
  let logoUrl = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "Unauthorized" };
    }

    // Upload Logo if present
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cafe-logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue but warn? Or just skip logo.
      } else {
        const { data } = supabase.storage
          .from('cafe-logos')
          .getPublicUrl(filePath);
        logoUrl = data.publicUrl;
      }
    }

    // Insert Cafe
    const { data: cafeData, error } = await supabase
      .from("cafes")
      .insert({
        owner_id: user.id,
        name: name,
        slug: slug,
        stamps_required: stamps,
        // pin_code: pin, // Moved to cafe_secrets
        brand_color: color,
        logo_url: logoUrl
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      if (error.code === "23505") {
        return { success: false, message: "This cafe URL is already taken." };
      }
      return { success: false, message: "Failed to create cafe. Please try again." };
    }

    // Insert Secret PIN
    const { error: secretError } = await supabase
      .from("cafe_secrets")
      .insert({
        cafe_id: cafeData.id,
        pin_code: pin
      });

    if (secretError) {
      console.error("Secret insert error:", secretError);
      // Clean up cafe if secret fails? ideally transaction, but for now just warn
      // or try to delete the cafe to prevent partial state
      await supabase.from("cafes").delete().eq("id", cafeData.id);
      return { success: false, message: "Failed to set security PIN. Please try again." };
    }

    return { success: true, cafeId: cafeData.id, slug: cafeData.slug };
  } catch (e) {
    console.error("Unexpected error:", e);
    return { success: false, message: "An unexpected error occurred." };
  }
}
