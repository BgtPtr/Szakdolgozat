"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSupabase } from "@/providers/SupabaseProvider";
import useLikedSongs from "@/hooks/useLikedSongs";

interface LikeButtonProps {
  songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  const router = useRouter();
  const supabaseClient = useSupabase();

  const authModal = useAuthModal();
  const { user } = useUser();

  // 🔹 Globális like store
  const { likedSongIds, setLikedState } = useLikedSongs();
  const likedFromStore = likedSongIds.includes(songId);

  // 🔹 Lokális állapot – az ikon ezt használja,
  // de mindig szinkronban tartjuk a store-ral
  const [isLiked, setIsLiked] = useState(likedFromStore);

  // Ha a store-ban változik az állapot, itt tükrözzük
  useEffect(() => {
    setIsLiked(likedFromStore);
  }, [likedFromStore]);

  // Inicializálás Supabase-ből (első betöltéskor)
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from("liked_songs")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .maybeSingle();

      if (!error && data) {
        setIsLiked(true);
        setLikedState(songId, true);
      } else {
        setIsLiked(false);
        setLikedState(songId, false);
      }
    };

    fetchData();
  }, [songId, supabaseClient, user?.id, setLikedState]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.openSignIn();
    }

    if (isLiked) {
      const { error } = await supabaseClient
        .from("liked_songs")
        .delete()
        .eq("user_id", user.id)
        .eq("song_id", songId);

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(false);
        setLikedState(songId, false);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabaseClient as any)
        .from("liked_songs")
        .insert({
          song_id: songId,
          user_id: user.id,
        } as any);

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(true);
        setLikedState(songId, true);
        toast.success("Tetszik!");
      }
    }

    // Ha valahol server komponens is épít a like-okra, az is frissül
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        // 🔹 Ne indítsa el a lejátszást a csempén
        e.stopPropagation();
        void handleLike();
      }}
      className="
        transition
        hover:opacity-80
        transition-transform
        duration-150
        hover:scale-110
        active:scale-95
      "
    >
      <Icon
        color={isLiked ? "#d6d31aff" : "white"}
        size={25}
        className={isLiked ? "drop-shadow-[0_0_8px_rgba(214,211,26,0.7)]" : ""}
      />
    </button>
  );
};

export default LikeButton;
