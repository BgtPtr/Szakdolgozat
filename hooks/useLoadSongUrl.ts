import { Song } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";

const useLoadSongUrl = (song: Song | null) => {
  const supabase = useSupabase();

  if (!song) {
    return '';
  }

  const { data: songData } = supabase
    .storage
    .from('songs')
    .getPublicUrl(song.song_path);

  return songData.publicUrl;
};

export default useLoadSongUrl;
