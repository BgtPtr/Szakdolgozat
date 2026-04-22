"use client";

import { useEffect, useState } from "react";
import { MdViewModule, MdViewList } from "react-icons/md";

import SongItem from "@/components/SongItem";
import LikeButton from "@/components/LikeButton";
import DeleteSongButton from "@/components/DeleteSongButton";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import type { Song } from "@/types";

interface PageContentProps {
  songs: Song[];
}

type ViewMode = "grid" | "list";

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [localSongs, setLocalSongs] = useState<Song[]>(songs);
  const { user } = useUser();

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const onPlay = useOnPlay(localSongs);

  const handleDeleted = (songId: string) => {
    setLocalSongs((current) => current.filter((song) => song.id !== songId));
  };

  if (localSongs.length === 0) {
    return (
      <div className="mt-4 text-neutral-400 text-sm">
        Még nincs feltöltött zeneszám.
      </div>
    );
  }

  const formatTime = (seconds: number | undefined) => {
    if (!seconds || Number.isNaN(seconds) || seconds <= 0) return "--:--";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <div className="flex items-center justify-end gap-x-2">
        <button type="button" onClick={() => setViewMode("grid")}>
          <MdViewModule size={16} />
        </button>
        <button type="button" onClick={() => setViewMode("list")}>
          <MdViewList size={16} />
        </button>
      </div>

      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {localSongs.map((song) => (
            <div key={song.id} className="relative">
              <SongItem
                data={song}
                onClick={(id: string) => onPlay(id)}
              />

              {song.user_id === user?.id && (
                <div className="absolute right-2 top-2 z-20">
                  <DeleteSongButton
                    songId={song.id}
                    onDeleted={handleDeleted}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-col gap-y-1">
          {localSongs.map((song) => {
            const formattedDuration = formatTime(song.duration ?? undefined);
            const canDelete = song.user_id === user?.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlay(song.id)}
                className="group flex items-center gap-x-4 w-full rounded-md bg-neutral-800/60 hover:bg-neutral-700/80 px-4 py-2 cursor-pointer transition"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {song.title ?? "Ismeretlen dal"}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {song.author ?? "Ismeretlen előadó"}
                  </p>
                </div>

                <div className="w-14 text-right text-xs text-neutral-300">
                  {formattedDuration}
                </div>

                <div className="ml-3">
                  <LikeButton songId={song.id} />
                </div>

                {canDelete && (
                  <div
                    className="ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <DeleteSongButton
                      songId={song.id}
                      onDeleted={handleDeleted}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageContent;