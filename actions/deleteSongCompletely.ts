"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/utils/supabase/server";

type SongForDelete = {
    id: string;
    user_id: string;
    song_path: string | null;
    image_path: string | null;
};

export async function deleteSongCompletely(songId: string) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Nincs bejelentkezett felhasználó.");
    }

    const { data, error: songError } = await supabase
        .from("songs")
        .select("id, user_id, song_path, image_path")
        .eq("id", songId)
        .single();

    const song = data as SongForDelete | null;

    if (songError || !song) {
        throw new Error("A dal nem található.");
    }

    if (song.user_id !== user.id) {
        throw new Error("Ezt a dalt nem törölheted.");
    }

    if (song.image_path) {
        const { error: imageRemoveError } = await supabase.storage
            .from("images")
            .remove([song.image_path]);

        if (imageRemoveError) {
            console.error("Kép törlési hiba:", imageRemoveError.message);
        }
    }

    if (song.song_path) {
        const { error: songRemoveError } = await supabase.storage
            .from("songs")
            .remove([song.song_path]);

        if (songRemoveError) {
            console.error("Hangfájl törlési hiba:", songRemoveError.message);
        }
    }

    const { error: deleteError } = await supabase
        .from("songs")
        .delete()
        .eq("id", songId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/liked");
    revalidatePath("/account");

    return { success: true };
}