"use server";

import type { Song } from "@/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const getSongsByUserId = async (): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  if (userError && userError.message !== "Auth session missing!") {
    console.error("getSongsByUserId user error:", userError.message);
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSongsByUserId query error:", error.message);
    return [];
  }

  return (data as Song[]) || [];
};

export default getSongsByUserId;