"use client";

import type { Song } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";

const FALLBACK_IMAGE = "/images/liked_.png";

const useLoadImage = (song: Song | null) => {
  const supabase = useSupabase();

  if (!song || !song.image_path) {
    return FALLBACK_IMAGE;
  }

  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(song.image_path);

  return data?.publicUrl ?? FALLBACK_IMAGE;
};

export default useLoadImage;