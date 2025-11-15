"use client";

import type { Song } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";

const useLoadImage = (song: Song | null) => {
  const supabase = useSupabase();

  // Ha nincs dal, vagy nincs image_path, adjunk vissza egy fallback képet
  if (!song || !song.image_path) {
    return "/images/liked.png"; // vagy bármelyik saját placeholdered
  }

  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(song.image_path);

  // Ha valamiért nem jön url, akkor is legyen fallback
  return data?.publicUrl ?? "/images/liked.png";
};

export default useLoadImage;
