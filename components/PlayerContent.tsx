"use client";

import { useEffect, useState } from "react";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
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
  const ids = usePlayer((state) => state.ids);
  const activeId = usePlayer((state) => state.activeId);
  const setId = usePlayer((state) => state.setId);

  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [detectedBpm, setDetectedBpm] = useState<number | null>(null);

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
    setDetectedBpm(
      typeof song?.bpm === "number" && song.bpm > 0 ? song.bpm : null
    );
  }, [song?.id, song?.bpm]);

  useEffect(() => {
    if (typeof song?.bpm === "number" && song.bpm > 0) return;
    if (!songUrl || typeof window === "undefined") return;

    let cancelled = false;

    const detectBpmFromSongUrl = async () => {
      try {
        const response = await fetch(songUrl);
        if (!response.ok) {
          throw new Error("A hangfájl nem tölthető be BPM elemzéshez.");
        }

        const arrayBuffer = await response.arrayBuffer();
        const AudioCtx =
          window.AudioContext ||
          (window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }).webkitAudioContext;

        if (!AudioCtx) return;

        const audioContext = new AudioCtx();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const mixedChannel = new Float32Array(audioBuffer.length);
        const channelsToMix = Math.min(audioBuffer.numberOfChannels, 2);

        for (let channelIndex = 0; channelIndex < channelsToMix; channelIndex++) {
          const channel = audioBuffer.getChannelData(channelIndex);
          for (let i = 0; i < channel.length; i++) {
            mixedChannel[i] += channel[i] / channelsToMix;
          }
        }

        const { default: MusicTempo } = await import("music-tempo");
        const mt = new MusicTempo(Array.from(mixedChannel));

        let bpm: number | null = null;

        if (
          typeof mt.tempo === "number" &&
          Number.isFinite(mt.tempo) &&
          mt.tempo > 0
        ) {
          bpm = Math.round(mt.tempo);
        } else if (Array.isArray(mt.beats) && mt.beats.length > 1) {
          const intervals: number[] = [];
          for (let i = 1; i < mt.beats.length; i++) {
            intervals.push(mt.beats[i] - mt.beats[i - 1]);
          }
          const avgInterval =
            intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
          const derivedBpm = 60 / avgInterval;

          if (Number.isFinite(derivedBpm) && derivedBpm > 0) {
            bpm = Math.round(derivedBpm);
          }
        }

        if (!cancelled) {
          setDetectedBpm(bpm);
        }

        await audioContext.close();
      } catch (error) {
        console.error("BPM detektálási hiba:", error);
        if (!cancelled) {
          setDetectedBpm(null);
        }
      }
    };

    detectBpmFromSongUrl();

    return () => {
      cancelled = true;
    };
  }, [song?.id, song?.bpm, songUrl]);

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

    let frame = 0;

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

  const handlePlayPause = () => {
    if (!sound) return;

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleNext = () => {
    if (ids.length === 0) return;

    const currentIndex = ids.findIndex((id) => id === activeId);
    const nextSong = ids[currentIndex + 1];

    if (nextSong) {
      setId(nextSong);
    }
  };

  const handlePrevious = () => {
    if (ids.length === 0) return;

    const currentIndex = ids.findIndex((id) => id === activeId);
    const prevSong = ids[currentIndex - 1];

    if (prevSong) {
      setId(prevSong);
    }
  };

  const toggleMute = () => {
    setVolume((current) => (current === 0 ? 1 : 0));
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

  const bpmValue =
    typeof song?.bpm === "number" && song.bpm > 0 ? song.bpm : detectedBpm;
  const bpmLabel =
    typeof bpmValue === "number" && bpmValue > 0 ? `${bpmValue} bpm` : "-- bpm";

  return (
    <div className="flex h-full items-center justify-between px-30 gap-x-4">
      <div className="flex items-center gap-x-4 w-[30%] min-w-[120px]">
        <MediaItem data={song} />

        <span className="text-xs text-neutral-400 whitespace-nowrap">
          {bpmLabel}
        </span>

        <LikeButton songId={song.id} />
      </div>

      <div className="flex flex-col items-center justify-center w-[40%] max-w-xl">
        <div className="flex items-center gap-x-4 mb-1">
          <button
            onClick={handlePrevious}
            className="text-neutral-400 hover:text-white transition-transform duration-150 hover:scale-110"
          >
            <AiFillStepBackward size={30} />
          </button>

          <button
            onClick={handlePlayPause}
            className="
              flex items-center justify-center
              rounded-full
              bg-[#d6d31a]
              text-black
              w-10 h-10
              hover:scale-105
              transition-transform
              duration-150
              shadow-[0_0_14px_rgba(214,211,26,0.75)]
            "
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
