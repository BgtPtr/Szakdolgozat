import { create } from "zustand";

interface LikedSongsStore {
  likedSongIds: string[];
  setLikedState: (songId: string, isLiked: boolean) => void;
}

const useLikedSongs = create<LikedSongsStore>((set) => ({
  likedSongIds: [],
  setLikedState: (songId, isLiked) =>
    set((state) => {
      const exists = state.likedSongIds.includes(songId);

      if (isLiked) {
        if (exists) return state;
        return { likedSongIds: [...state.likedSongIds, songId] };
      }

      if (!exists) return state;
      return {
        likedSongIds: state.likedSongIds.filter((id) => id !== songId),
      };
    }),
}));

export default useLikedSongs;
