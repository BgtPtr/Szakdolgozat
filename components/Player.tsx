"use client";

import usePlayer from "@/hooks/usePlayer";
import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import PlayerContent from "./PlayerContent";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);

  // Mindig lefut, de elfogadja a null-t is
  const songUrl = useLoadSongUrl(song ?? null);

  if (!song || !songUrl || !player.activeId) {
    return null;
  }

  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        h-20
        bg-black
        border-t
        border-neutral-800
        shadow-[0_-4px_20px_rgba(0,0,0,0.5)]
        px-4
      "
    >
      <PlayerContent song={song} songUrl={songUrl} />
    </div>
  );
};

export default Player;
