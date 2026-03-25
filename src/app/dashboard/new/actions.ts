"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createCafe(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string; // Ideally sanitize this
  const stampsRequired = parseInt(formData.get("stamps_required") as string) || 10;
  
  if (!name || !slug) {
    return { error: "Name and Slug are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("cafes")
    .insert([
      { 
        name, 
        slug, 
        owner_id: user.id, 
        stamps_required: stampsRequired 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating cafe:", error);
    if (error.code === "23505") { // Unique violation for slug
        return { error: "This slug is already taken. Please choose another one." };
    }
    return { error: error.message };
  }

  return redirect(`/dashboard/cafe/${data.slug}`);
}
