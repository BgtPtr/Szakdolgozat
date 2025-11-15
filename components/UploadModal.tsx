"use client";

import useUploadModal from "@/hooks/useUploadModal";
import Modal from "./Modal";
import Input from "./Input";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import uniqid from "uniqid";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/providers/SupabaseProvider";

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

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error("Hiányzó mezők!");
        return;
      }

      const uniqueID = uniqid();

      // Zenefeltöltés
      const {
        data: songData,
        error: songError,
      } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error("Sikertelen zenefeltöltés.");
      }

      // Képfeltöltés
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient.storage
        .from("images")
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error("Sikertelen képfeltöltés.");
      }
      // Supabase types trükközése miatt itt any-t használunk
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: supabaseError } = await (supabaseClient as any)
        .from("songs")
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
        } as any);

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success("A dal feltöltve!");
      reset();
      uploadModal.onClose();
    } catch (_error) {
      toast.error("Valami félrement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Dalfeltöltés"
      description="Tölts fel egy dalt!"
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
