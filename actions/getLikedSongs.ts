"use server";

import type { Song } from "@/types";
import type { Database } from "@/types_db";
import { createServerSupabaseClient } from "@/utils/supabase/server";

type LikedSongRow = Database["public"]["Tables"]["liked_songs"]["Row"] & {
  songs: Database["public"]["Tables"]["songs"]["Row"];
};

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("liked_songs")
    .select("*, songs(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  if (!data) {
    return [];
  }

  return (data as LikedSongRow[]).map((item) => ({
    ...(item.songs as Song),
  }));
};

export default getLikedSongs;
