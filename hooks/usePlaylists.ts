"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import type { Playlist } from "@/types";

const usePlaylists = () => {
    const supabase = useSupabase();
    const { user } = useUser();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadPlaylists = useCallback(async () => {
        if (!user?.id) {
            setPlaylists([]);
            return;
        }

        setIsLoading(true);

        const supabaseAny = supabase as any;

        const { data, error } = await supabaseAny
            .from("playlists")
            .select(`
        id,
        created_at,
        user_id,
        name,
        playlist_songs (
          playlist_id,
          song_id,
          created_at,
          songs (*)
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Playlist betöltési hiba:", error.message);
            setPlaylists([]);
            setIsLoading(false);
            return;
        }

        setPlaylists((data as Playlist[]) ?? []);
        setIsLoading(false);
    }, [supabase, user?.id]);

    useEffect(() => {
        loadPlaylists();
    }, [loadPlaylists]);

    const createPlaylist = useCallback(
        async (name: string) => {
            if (!user?.id) {
                throw new Error("Nincs bejelentkezett felhasználó.");
            }

            const cleanName = name.trim();

            if (!cleanName) {
                throw new Error("A mappa neve nem lehet üres.");
            }

            const supabaseAny = supabase as any;

            const { error } = await supabaseAny.from("playlists").insert({
                name: cleanName,
                user_id: user.id,
            });

            if (error) {
                throw new Error(error.message);
            }

            await loadPlaylists();
        },
        [supabase, user?.id, loadPlaylists]
    );

    const deletePlaylist = useCallback(
        async (playlistId: string) => {
            const supabaseAny = supabase as any;

            const { error } = await supabaseAny
                .from("playlists")
                .delete()
                .eq("id", playlistId);

            if (error) {
                throw new Error(error.message);
            }

            await loadPlaylists();
        },
        [supabase, loadPlaylists]
    );

    const addSongToPlaylist = useCallback(
        async (playlistId: string, songId: string) => {
            const supabaseAny = supabase as any;

            const { error } = await supabaseAny
                .from("playlist_songs")
                .upsert(
                    {
                        playlist_id: playlistId,
                        song_id: songId,
                    },
                    {
                        onConflict: "playlist_id,song_id",
                    }
                );

            if (error) {
                throw new Error(error.message);
            }

            await loadPlaylists();
        },
        [supabase, loadPlaylists]
    );

    const removeSongFromPlaylist = useCallback(
        async (playlistId: string, songId: string) => {
            const supabaseAny = supabase as any;

            const { error } = await supabaseAny
                .from("playlist_songs")
                .delete()
                .eq("playlist_id", playlistId)
                .eq("song_id", songId);

            if (error) {
                throw new Error(error.message);
            }

            await loadPlaylists();
        },
        [supabase, loadPlaylists]
    );

    return {
        playlists,
        isLoading,
        reloadPlaylists: loadPlaylists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
    };
};

export default usePlaylists;