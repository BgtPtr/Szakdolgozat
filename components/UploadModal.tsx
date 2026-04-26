"use client";

import { useState } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { useSupabase } from "@/providers/SupabaseProvider";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import uniqid from "uniqid";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabase();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const detectBpmAndDuration = async (
    songFile: File
  ): Promise<{ bpm: number | null; duration: number | null }> => {
    if (typeof window === "undefined") {
      return { bpm: null, duration: null };
    }

    try {
      console.log("▶️ BPM detektálás indul a fájlra:", songFile.name);

      const arrayBuffer = await songFile.arrayBuffer();

      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        console.warn("AudioContext nem elérhető ebben a böngészőben.");
        return { bpm: null, duration: null };
      }

      const audioContext = new AudioCtx();

      const audioBuffer: AudioBuffer = await audioContext.decodeAudioData(
        arrayBuffer
      );

      const durationSeconds = Math.round(audioBuffer.duration);
      console.log("⏱ Detektált hossz (mp):", durationSeconds);

      const audioData: number[] = [];

      if (audioBuffer.numberOfChannels >= 2) {
        const channel1 = audioBuffer.getChannelData(0);
        const channel2 = audioBuffer.getChannelData(1);
        const len = channel1.length;

        for (let i = 0; i < len; i++) {
          audioData[i] = (channel1[i] + channel2[i]) / 2;
        }
      } else {
        const ch = audioBuffer.getChannelData(0);
        const len = ch.length;
        for (let i = 0; i < len; i++) {
          audioData[i] = ch[i];
        }
      }

      const { default: MusicTempo } = await import("music-tempo");
      const mt = new MusicTempo(audioData);

      let bpm: number | null = null;

      if (
        typeof mt.tempo === "number" &&
        !Number.isNaN(mt.tempo) &&
        mt.tempo > 0
      ) {
        bpm = Math.round(mt.tempo);
      } else if (Array.isArray(mt.beats) && mt.beats.length > 1) {
        // Fallback: ha a tempo mező üres, kiszámoljuk a beatek közti átlagos időből
        const intervals: number[] = [];
        for (let i = 1; i < mt.beats.length; i++) {
          intervals.push(mt.beats[i] - mt.beats[i - 1]);
        }
        const avgInterval =
          intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
        const derived = 60 / avgInterval; // 60s / (átlagos máspodperc/beat) = BPM

        if (derived > 0 && Number.isFinite(derived)) {
          bpm = Math.round(derived);
        }
      }

      console.log("🎚 Számolt BPM:", bpm, "Beats count:", mt.beats?.length);

      return {
        bpm,
        duration: durationSeconds > 0 ? durationSeconds : null,
      };
    } catch (error) {
      console.error("❌ Hiba az offline BPM felismerésnél:", error);
      return { bpm: null, duration: null };
    }
  };


  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0] as File | undefined;
      const songFile = values.song?.[0] as File | undefined;

      if (!imageFile || !songFile || !user) {
        toast.error("Hiányzó mezők!");
        return;
      }

      const uniqueID = uniqid();

      // 1) Lokális BPM + hossz felismerés (OFFLINE)
      const { bpm, duration } = await detectBpmAndDuration(songFile);
      console.log("Lokálisan számolt BPM / duration:", { bpm, duration });

      // 2) Dal feltöltése Supabase Storage-be
      const {
        data: songData,
        error: songError,
      } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (songError || !songData) {
        console.error(songError);
        setIsLoading(false);
        return toast.error("Sikertelen zenefeltöltés.");
      }

      // 3) Kép feltöltése Supabase Storage-be
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient.storage
        .from("images")
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError || !imageData) {
        console.error(imageError);
        setIsLoading(false);
        return toast.error("Sikertelen képfeltöltés.");
      }

      // 4) Sor beszúrása a songs táblába – BPM + duration mezőkkel
      const { error: supabaseError } = await (supabaseClient as any)
        .from("songs")
        .insert({
          user_id: user.id,
          title: values.title as string,
          author: values.author as string,
          image_path: imageData.path as string,
          song_path: songData.path as string,
          bpm,
          duration,
        });

      if (supabaseError) {
        console.error(supabaseError);
        setIsLoading(false);
        return toast.error("Hiba történt a dal mentésekor.");
      }

      toast.success("A dal feltöltve!");
      router.refresh();
      reset();
      uploadModal.onClose();
    } catch (error) {
      console.error(error);
      toast.error("Valami félrement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Dalfeltöltés"
      description=""
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register("title", { required: true })}
          placeholder="Dalcím"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register("author", { required: true })}
          placeholder="Dalszerző"
        />

        <div>
          <div className="pb-1">Válassz egy dalt</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept="audio/mpeg,audio/wav,audio/flac"
            {...register("song", { required: true })}
          />
        </div>

        <div>
          <div className="pb-1">Válassz egy képet</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", { required: true })}
          />
        </div>

        <Button disabled={isLoading} type="submit">
          Küldés
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
