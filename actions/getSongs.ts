"use server";

import type { Song } from "@/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const getSongs = async (): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSongs error:", error.message);
    return [];
  }

  return (data as Song[]) || [];
};

export default getSongs;
