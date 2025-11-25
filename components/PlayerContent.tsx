"use client";

import { useEffect, useState } from "react";
import {
  AiFillStepBackward,
  AiFillStepForward,
} from "react-icons/ai";
import { FaPlay, FaPause } from "react-icons/fa";
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2";
import useSound from "use-sound";

import usePlayer from "@/hooks/usePlayer";
import type { Song } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();

  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const [play, { pause, sound }] = useSound(songUrl, {
    volume,
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    onend: () => {
      setIsPlaying(false);
      setPosition(0);
      handleNext();
    },
    format: ["mp3"],
  });

  useEffect(() => {
    if (!sound) return;

    sound.play();
    setIsPlaying(true);

    const d = sound.duration();
    if (d && !Number.isNaN(d)) {
      setDuration(d);
    }

    return () => {
      sound.stop();
    };
  }, [sound]);

  useEffect(() => {
    if (!sound) return;

    let frame: number;

    const update = () => {
      const current = sound.seek() as number;
      setPosition(current);
      frame = requestAnimationFrame(update);
    };

    if (isPlaying) {
      frame = requestAnimationFrame(update);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sound, isPlaying]);

  useEffect(() => {
    player.setIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      player.setIsPlaying(false);
    };
  }, []);

  const handlePlayPause = () => {
    if (!sound) return;

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleNext = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (nextSong) {
      player.setId(nextSong);
    }
  };

  const handlePrevious = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const prevSong = player.ids[currentIndex - 1];

    if (prevSong) {
      player.setId(prevSong);
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  useEffect(() => {
    if (sound) {
      sound.volume(volume);
    }
  }, [volume, sound]);

  const handleSeek = (value: number) => {
    if (!sound) return;
    sound.seek(value);
    setPosition(value);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const PlayIcon = isPlaying ? FaPause : FaPlay;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  return (
    <div className="flex h-full items-center justify-between px-30 gap-x-4">
      {/* Bal oldal: cím / előadó */}
      <div className="flex items-center gap-x-20 w-[30%] min-w-[120px]">
        <MediaItem data={song} />
        <LikeButton songId={song.id} />
        <div className="flex flex-col"></div>
      </div>

      {/* Közép: vezérlők + progress bar */}
      <div className="flex flex-col items-center justify-center w-[40%] max-w-xl">
        {/* Gombok */}
        <div className="flex items-center gap-x-4 mb-1">
          <button
            onClick={handlePrevious}
            className="text-neutral-400 hover:text-white transition-transform duration-150 hover:scale-110"
          >
            <AiFillStepBackward size={30} />
          </button>

          <button
            onClick={handlePlayPause}
              className={`
              flex items-center justify-center
              rounded-full
              bg-[#d6d31a]
              text-black
              w-10 h-10
              hover:scale-105
              transition-transform
              duration-150
              shadow-[0_0_14px_rgba(214,211,26,0.75)]
            `}
          >
            <PlayIcon size={26} />
          </button>

          <button
            onClick={handleNext}
            className="text-neutral-400 hover:text-white transition-transform duration-150 hover:scale-110"
          >
            <AiFillStepForward size={30} />
          </button>
        </div>

        <div className="flex items-center gap-x-4 w-full">
          <span className="text-[13px] text-neutral-400 w-10 text-right">
            {formatTime(position)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={position}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className={`
              w-full
              cursor-pointer
              bg-transparent
              accent-[#d6d31a]
              rounded-full
              transition-shadow
              duration-200
              ${isPlaying ? "shadow-[0_0_8px_rgba(214,211,26,0.55)]" : ""}
            `}
          />

          <span className="text-[13px] text-neutral-300 w-10">
            {formatTime(duration - position)}
          </span>
        </div>
      </div>

      {/* Jobb oldal: hangerő */}
      <div className="flex items-center gap-x-2 justify-end w-[30%] min-w-[120px]">
        <button
          onClick={toggleMute}
          className="text-neutral-400 hover:text-white transition-transform duration-150 hover:scale-110"
        >
          <VolumeIcon size={20} />
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className={`
            w-24
            md:w-32
            cursor-pointer
            bg-transparent
            accent-[#d6d31a]
            rounded-full
            transition-shadow
            duration-200
            ${volume > 0 ? "shadow-[0_0_8px_rgba(214,211,26,0.55)]" : ""}
          `}
        />
      </div>
    </div>
  );
};

export default PlayerContent;
