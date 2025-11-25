"use client";

import { useState } from "react";
import { MdViewModule, MdViewList } from "react-icons/md";

import SongItem from "@/components/SongItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import type { Song } from "@/types";

interface PageContentProps {
  songs: Song[];
}

type ViewMode = "grid" | "list";

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const onPlay = useOnPlay(songs);

  if (songs.length === 0) {
    return (
      <div className="mt-4 text-neutral-400 text-sm">
        Még nincs elérhető zeneszám.
      </div>
    );
  }

  // Másodpercek -> "m:ss" formátum
  const formatTime = (seconds: number | undefined) => {
    if (!seconds || Number.isNaN(seconds) || seconds <= 0) return "--:--";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-4 flex flex-col gap-y-4">
      {/* Nézetváltó */}
      <div className="flex items-center justify-end gap-x-2">
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          className={`
            flex items-center justify-center
            h-8 w-8
            rounded-full
            border
            text-xs
            transition
            ${
              viewMode === "grid"
                ? "bg-[#d6d31a] border-[#d6d31a] text-black shadow-[0_0_12px_rgba(214,211,26,0.6)]"
                : "bg-transparent border-neutral-600 text-neutral-300 hover:border-[#d6d31a] hover:text-[#d6d31a]"
            }
          `}
        >
          <MdViewModule size={16} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`
            flex items-center justify-center
            h-8 w-8
            rounded-full
            border
            text-xs
            transition
            ${
              viewMode === "list"
                ? "bg-[#d6d31a] border-[#d6d31a] text-black shadow-[0_0_12px_rgba(214,211,26,0.6)]"
                : "bg-transparent border-neutral-600 text-neutral-300 hover:border-[#d6d31a] hover:text-[#d6d31a]"
            }
          `}
        >
          <MdViewList size={16} />
        </button>
      </div>

      {/* GRID NÉZET – a régi csempés nézet */}
      {viewMode === "grid" && (
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-4
          "
        >
          {songs.map((song) => (
            <SongItem
              key={song.id}
              data={song}
              onClick={(id: string) => onPlay(id)}
            />
          ))}
        </div>
      )}

      {/* LISTA NÉZET – itt jelenik meg BPM + hossz */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-y-1">
          {songs.map((song) => {
            // Hossz (másodpercben) – adatbázisból, pl. "duration" mező
            const rawDuration = (song as any).duration as
              | number
              | undefined
              | null;
            const formattedDuration = formatTime(
              typeof rawDuration === "number" ? rawDuration : undefined
            );

            // BPM – adatbázis "bpm" mezőből
            const rawBpm = (song as any).bpm as
              | number
              | undefined
              | null;
            const bpmLabel =
              typeof rawBpm === "number" && !Number.isNaN(rawBpm) && rawBpm > 0
                ? `${Math.round(rawBpm)} bpm`
                : "-- bpm";

            return (
              <div
                key={song.id}
                onClick={() => onPlay(song.id)}
                className="
                  group
                  flex
                  items-center
                  gap-x-4
                  w-full
                  rounded-md
                  bg-neutral-800/60
                  hover:bg-neutral-700/80
                  px-4
                  py-2
                  cursor-pointer
                  transition
                "
              >
                {/* Dalcím + előadó + BPM */}
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {song.title ?? "Ismeretlen dal"}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {song.author ?? "Ismeretlen előadó"}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {bpmLabel}
                  </p>
                </div>

                {/* hossz (perc:másodperc) */}
                <div className="w-14 text-right text-xs text-neutral-300">
                  {formattedDuration}
                </div>

                {/* Like a jobb oldalon */}
                <div className="ml-3">
                  <LikeButton songId={song.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageContent;
