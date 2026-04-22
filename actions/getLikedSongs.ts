import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Song } from "@/types";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error: likedError } = await supabase
    .from("liked_songs")
    .select("songs(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (likedError || !data) {
    return [];
  }

  return data
    .map((item: any) => item.songs)
    .filter(Boolean) as Song[];
};

export default getLikedSongs;