"use client";

import { useEffect, useState, type DragEvent } from "react";
import Image from "next/image";

import type { Song } from "@/types";
import LikeButton from "@/components/LikeButton";
import DeleteSongButton from "@/components/DeleteSongButton";
import useLoadImage from "@/hooks/useLoadImage";
import usePlayer from "@/hooks/usePlayer";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
  showDelete?: boolean;
}

const FALLBACK_IMAGE = "/images/liked_.png";

const SongItem: React.FC<SongItemProps> = ({
  data,
  onClick,
  showDelete = false,
}) => {
  const imageUrl = useLoadImage(data);
  const player = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(imageUrl || FALLBACK_IMAGE);
  }, [imageUrl]);

  const isActive = player.activeId === data.id;

  const handleCardClick = () => {
    onClick(data.id);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!data.id) return;

    const dt = event.dataTransfer;
    if (!dt) return;

    setIsDragging(true);
    dt.effectAllowed = "move";
    dt.setData("text/song-id", data.id);
    dt.setData("text/plain", data.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      onClick={handleCardClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        group
        relative
        flex
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-md
        bg-neutral-800/50
        p-3
        transition
        hover:bg-neutral-700/70
        hover:shadow-lg
        ${isActive ? "ring-2 ring-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.6)] animate-pulse" : ""}
        ${isDragging ? "scale-[0.97] opacity-90" : ""}
      `}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md">
        <Image
          className="object-cover"
          src={imgSrc}
          fill
          loading="eager"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 220px"
          alt={data.title ?? "Zeneszám borítója"}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        <div className="absolute left-2 top-2 z-20">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-black/65
              backdrop-blur-sm
              shadow-md
            "
          >
            <LikeButton songId={data.id} />
          </div>
        </div>

        {showDelete && (
          <div className="absolute right-2 top-2 z-20">
            <DeleteSongButton songId={data.id} />
          </div>
        )}
      </div>

      <div className="mt-3 flex w-full flex-col">
        <p className="truncate text-sm font-semibold text-white">
          {data.title ?? "Ismeretlen dal"}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {data.author ?? "Ismeretlen előadó"}
        </p>
      </div>
    </div>
  );
};

export default SongItem;