"use server";

import type { Song } from "@/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import getSongs from "./getSongs";

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  if (!title) {
    const allSongs = await getSongs();
    return allSongs;
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .or(`title.ilike.%${title}%,author.ilike.%${title}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSongsByTitle error:", error.message);
    return [];
  }

  return (data as Song[]) || [];
};

export default getSongsByTitle;
