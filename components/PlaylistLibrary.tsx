"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiFolder, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import usePlaylists from "@/hooks/usePlaylists";

const PlaylistLibrary = () => {
    const {
        playlists,
        isLoading,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
    } = usePlaylists();

    const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

    const toggleOpen = (playlistId: string) => {
        setOpenIds((current) => ({
            ...current,
            [playlistId]: !current[playlistId],
        }));
    };

    const handleCreatePlaylist = async () => {
        const name = window.prompt("Add meg az új mappa nevét:");

        if (!name) return;

        try {
            await createPlaylist(name);
            toast.success("A mappa elmentve.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Nem sikerült menteni a mappát."
            );
        }
    };

    const handleDeletePlaylist = async (playlistId: string) => {
        const confirmed = window.confirm("Biztosan törölni szeretnéd ezt a mappát?");

        if (!confirmed) return;

        try {
            await deletePlaylist(playlistId);
            toast.success("A mappa törölve.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Nem sikerült törölni a mappát."
            );
        }
    };

    const handleDropSong = async (
        e: React.DragEvent<HTMLDivElement>,
        playlistId: string
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const songId =
            e.dataTransfer.getData("text/song-id") ||
            e.dataTransfer.getData("text/plain");

        if (!songId) return;

        try {
            await addSongToPlaylist(playlistId, songId);
            toast.success("A dal bekerült a mappába.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Nem sikerült a dal hozzáadása."
            );
        }
    };

    return (
        <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Lejátszási listák
                </p>

                <button
                    type="button"
                    onClick={handleCreatePlaylist}
                    className="rounded-full p-1 text-neutral-300 transition hover:text-white"
                    title="Új mappa"
                >
                    <FiPlus size={16} />
                </button>
            </div>

            {isLoading && (
                <p className="text-xs text-neutral-500">Betöltés...</p>
            )}

            <div className="flex flex-col gap-y-2">
                {playlists.map((playlist) => {
                    const isOpen = !!openIds[playlist.id];
                    const songs = playlist.playlist_songs ?? [];

                    return (
                        <div
                            key={playlist.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropSong(e, playlist.id)}
                            className="rounded-md border border-neutral-700 bg-neutral-900/70 p-3"
                        >
                            <div className="flex items-center justify-between gap-x-2">
                                <button
                                    type="button"
                                    onClick={() => toggleOpen(playlist.id)}
                                    className="flex min-w-0 flex-1 items-center gap-x-2 text-left"
                                >
                                    {isOpen ? (
                                        <FiChevronDown className="shrink-0 text-neutral-300" size={14} />
                                    ) : (
                                        <FiChevronRight className="shrink-0 text-neutral-300" size={14} />
                                    )}

                                    <FiFolder className="shrink-0 text-neutral-300" size={14} />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">
                                            {playlist.name}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {songs.length} dal
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeletePlaylist(playlist.id)}
                                    className="rounded-full p-1 text-neutral-400 transition hover:text-red-400"
                                    title="Mappa törlése"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>

                            {isOpen && (
                                <div className="mt-3 flex flex-col gap-y-2">
                                    {songs.length === 0 ? (
                                        <p className="text-xs text-neutral-500">
                                            Húzz ide egy dalt a csempéről.
                                        </p>
                                    ) : (
                                        songs.map((item) => (
                                            <div
                                                key={`${item.playlist_id}-${item.song_id}`}
                                                className="flex items-center justify-between gap-x-2 rounded-md bg-neutral-800/60 px-2 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm text-white">
                                                        {item.songs?.title ?? "Ismeretlen dal"}
                                                    </p>
                                                    <p className="truncate text-xs text-neutral-400">
                                                        {item.songs?.author ?? "Ismeretlen előadó"}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await removeSongFromPlaylist(playlist.id, item.song_id);
                                                            toast.success("A dal kikerült a mappából.");
                                                        } catch (error) {
                                                            toast.error(
                                                                error instanceof Error
                                                                    ? error.message
                                                                    : "Nem sikerült eltávolítani a dalt."
                                                            );
                                                        }
                                                    }}
                                                    className="rounded-full p-1 text-neutral-400 transition hover:text-red-400"
                                                    title="Eltávolítás a mappából"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlaylistLibrary;