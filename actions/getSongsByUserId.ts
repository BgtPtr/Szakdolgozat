"use server";

import type { Song } from "@/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const getSongsByUserId = async (): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("getSongsByUserId session error:", sessionError.message);
    return [];
  }

  const userId = sessionData?.session?.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSongsByUserId query error:", error.message);
    return [];
  }

  return (data as Song[]) || [];
};

export default getSongsByUserId;
