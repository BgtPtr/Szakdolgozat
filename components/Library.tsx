"use client";

import { useEffect, useState, type DragEvent } from "react";
import { TbPlaylist } from "react-icons/tb";
import {
  AiOutlinePlus,
  AiOutlineFolderAdd,
  AiOutlineClose,
} from "react-icons/ai";
import { FiChevronDown, FiChevronRight, FiTrash2 } from "react-icons/fi";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import useUploadModal from "@/hooks/useUploadModal";
import type { Song } from "@/types";
import MediaItem from "./MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";


interface LibraryProps {
  songs: Song[];
}

type Playlist = {
  id: string;
  name: string;
  songIds: string[];
};

type DragOrigin = "library" | string | null; // string = playlistId

const Library: React.FC<LibraryProps> = ({ songs }) => {
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const player = usePlayer();

  // Dalok sorrendje (fő lista)
  const [orderedSongs, setOrderedSongs] = useState<Song[]>(songs);

  // Drag & drop állapot
  const [draggingSongId, setDraggingSongId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<DragOrigin>(null);

  // Lejátszási listák / mappák
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Nyitott mappák
  const [openPlaylistIds, setOpenPlaylistIds] = useState<string[]>([]);

  // Globális lejátszás – a teljes könyvtárra
  const onPlay = useOnPlay(orderedSongs);

  // Külső songs → lokális orderedSongs sync
  useEffect(() => {
    setOrderedSongs(songs);
  }, [songs]);

  // Playlist-ek betöltése
  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setOpenPlaylistIds([]);
      return;
    }

    const key = `petify_playlists_${user.id}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setPlaylists(JSON.parse(raw) as Playlist[]);
      }
    } catch (e) {
      console.error("Nem sikerült betölteni a lejátszási listákat:", e);
    }
  }, [user]);

  // Playlist-ek mentése
  useEffect(() => {
    if (!user) return;
    const key = `petify_playlists_${user.id}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(playlists));
    } catch (e) {
      console.error("Nem sikerült elmenteni a lejátszási listákat:", e);
    }
  }, [playlists, user]);

  // Dal feltöltés (+ ikon)
  const onClickAddSong = () => {
    if (!user) return authModal.openSignIn();
    uploadModal.onOpen();
  };

  // Új lejátszási lista
  const onClickAddPlaylist = () => {
    if (!user) return authModal.openSignIn();

    const name = window.prompt("Adj nevet az új lejátszási listának:");
    if (!name) return;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;

    // csak playlist state-et módosítunk – a Playerhez nem nyúlunk,
    // így a lejátszás NEM szakad meg
    setPlaylists((prev) => [...prev, { id, name, songIds: [] }]);
  };

  // Playlist lenyitás / bezárás
  const togglePlaylistOpen = (playlistId: string) => {
    setOpenPlaylistIds((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  // Playlist törlése
  const deletePlaylist = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    const name = pl?.name ?? "ezt a lejátszási listát";
    if (!window.confirm(`Biztosan törlöd: "${name}" ?`)) return;

    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setOpenPlaylistIds((prev) => prev.filter((id) => id !== playlistId));
  };

  // Dal törlése playlistből
  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) }
          : pl
      )
    );
  };

  // ----- DRAG & DROP -----

  // Külső lista – drag kezdete
  const handleDragStartFromLibrary = (songId: string) => {
    setDraggingSongId(songId);
    setDraggingFrom("library");
  };

  // Playlisten belül – drag kezdete
  const handleDragStartFromPlaylist = (playlistId: string, songId: string) => {
    setDraggingSongId(songId);
    setDraggingFrom(playlistId);
  };

  const resetDrag = () => {
    setDraggingSongId(null);
    setDraggingFrom(null);
  };

  // Fő listában dalra ejtve → sorrendcsere a fő listában
  const handleDropOnSong = (targetId: string) => {
    if (!draggingSongId || draggingSongId === targetId) return resetDrag();
    if (draggingFrom !== "library") return resetDrag();

    setOrderedSongs((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((s) => s.id === draggingSongId);
      const toIndex = updated.findIndex((s) => s.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });

    resetDrag();
  };

  // Playlist headerre ejtve:
  // - ha library-ből jön → hozzáadjuk
  // - ha ugyanabból a playlistből jön → semmi (ott belül kezeljük a rendezést)
    // Playlist headerre ejtve:
  // - ha library-ből jön → hozzáadjuk
  // - ha ugyanabból a playlistből jön → semmi (ott belül kezeljük a rendezést)
  // - ha csempéről jön (külső drag) → úgy kezeljük, mint a library-t
  const handleDropOnPlaylist = (
    event: DragEvent<HTMLDivElement>,
    playlistId: string
  ) => {
    event.preventDefault();

    // Ha Library-ből vagy playlistből húztuk, ott van draggingSongId
    // Ha csempéről (SongItem), akkor a dataTransfer-ben van az id
    const fromData =
      event.dataTransfer.getData("text/song-id") ||
      event.dataTransfer.getData("text/plain");

    const songId = draggingSongId ?? fromData;

    if (!songId) {
      return resetDrag();
    }

    // Csak akkor adunk hozzá, ha library-ből vagy külső (csempe) forrásból jön.
    // Playlist → playlist átvitel most sem történik, marad az eredeti logika.
    if (draggingFrom === "library" || !draggingFrom) {
      setPlaylists((prev) =>
        prev.map((pl) =>
          pl.id === playlistId
            ? {
                ...pl,
                songIds: pl.songIds.includes(songId)
                  ? pl.songIds
                  : [...pl.songIds, songId],
              }
            : pl
        )
      );
    }

    resetDrag();
  };


  // Playlisten belüli dalra ejtve → sorrendcsere ugyanabban a playlistben
  const handleDropOnPlaylistSong = (playlistId: string, targetSongId: string) => {
    if (!draggingSongId) return resetDrag();
    if (draggingFrom !== playlistId) return resetDrag();
    if (draggingSongId === targetSongId) return resetDrag();

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const ids = [...pl.songIds];
        const fromIndex = ids.indexOf(draggingSongId);
        const toIndex = ids.indexOf(targetSongId);
        if (fromIndex === -1 || toIndex === -1) return pl;

        ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, draggingSongId);
        return { ...pl, songIds: ids };
      })
    );

    resetDrag();
  };

  // ----- PLAYLIST LEJÁTSZÁS -----

  const playFromPlaylist = (playlistSongs: Song[], songId: string) => {
    if (!user) return authModal.openSignIn();

    const ids = playlistSongs.map((s) => s.id);
    player.setId(songId);
    player.setIds(ids);
  };

  // ---------- RENDER ----------

  return (
    <div className="flex flex-col">
      {/* Fejléc */}
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          pt-4
        "
      >
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist className="text-neutral-400" size={26} />
          <p className="text-neutral-400 font-medium text-md">Könyvtár</p>
        </div>

        <div className="flex items-center gap-x-3">
          <button
            type="button"
            onClick={onClickAddPlaylist}
            className="text-neutral-400 hover:text-white transition"
            title="Új lejátszási lista"
          >
            <AiOutlineFolderAdd size={20} />
          </button>

          <button
            type="button"
            onClick={onClickAddSong}
            className="text-neutral-400 hover:text-white transition"
            title="Dal feltöltése"
          >
            <AiOutlinePlus size={20} />
          </button>
        </div>
      </div>

      {/* LEJÁTSZÁSI LISTÁK */}
      {playlists.length > 0 && (
        <div className="mt-4 px-5 flex flex-col gap-y-2">
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Lejátszási listák
          </p>

          {playlists.map((pl) => {
            const isOpen = openPlaylistIds.includes(pl.id);

            // *** ITT a javított logika: a playlist SAJÁT songIds sorrendjét követi
            const playlistSongs: Song[] = pl.songIds
              .map((id) => orderedSongs.find((s) => s.id === id))
              .filter((s): s is Song => Boolean(s));

            return (
              <div
                key={pl.id}
                className="
                  rounded-md
                  border
                  border-neutral-700
                  bg-neutral-900/70
                  hover:bg-neutral-800/80
                  transition
                "
              >
                {/* HEADER */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2
                    cursor-pointer
                  "
                  onClick={() => togglePlaylistOpen(pl.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnPlaylist(e, pl.id)}
                >
                  <div className="flex items-center gap-x-2">
                    {isOpen ? (
                      <FiChevronDown className="text-neutral-300 transform transition-transform duration-200" />
                    ) : (
                      <FiChevronRight className="text-neutral-300 transform transition-transform duration-200" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">
                        {pl.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {pl.songIds.length} dal
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(pl.id);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition"
                    title="Lejátszási lista törlése"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* LENYITOTT TARTALOM */}
                <div
                  className={`
                    overflow-hidden
                    transition-all
                    duration-300
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                  `}
                >
                  <div className="px-3 pb-2 flex flex-col gap-y-1">
                    {playlistSongs.length === 0 && (
                      <p className="text-xs text-neutral-500 italic py-1">
                        A lista üres – húzz ide dalokat a könyvtárból.
                      </p>
                    )}

                    {playlistSongs.map((song) => (
                      <div
                        key={song.id}
                        draggable
                        onDragStart={() =>
                          handleDragStartFromPlaylist(pl.id, song.id)
                        }
                        onDragEnd={resetDrag}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() =>
                          handleDropOnPlaylistSong(pl.id, song.id)
                        }
                        className={`
                          flex
                          items-center
                          justify-between
                          rounded
                          px-2
                          py-1
                          text-sm
                          text-neutral-100
                          transition-all
                          duration-200
                          ${
                            draggingSongId === song.id &&
                            draggingFrom === pl.id
                              ? "bg-emerald-600/30 scale-[0.98]"
                              : "hover:bg-neutral-800/80 hover:scale-[1.01]"
                          }
                        `}
                      >
                        <button
                          type="button"
                          className="flex flex-col text-left overflow-hidden"
                          onClick={() => playFromPlaylist(playlistSongs, song.id)}
                        >
                          <span className="truncate">{song.title}</span>
                          {song.author && (
                            <span className="text-xs text-neutral-400 truncate">
                              {song.author}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromPlaylist(pl.id, song.id);
                          }}
                          className="
                            text-neutral-500
                            hover:text-red-400
                            transition
                          "
                          title="Dal eltávolítása a listából"
                        >
                          <AiOutlineClose size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FŐ DAL LISTA */}
      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {orderedSongs.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStartFromLibrary(item.id)}
            onDragEnd={resetDrag}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOnSong(item.id)}
            className={`
              rounded-md
              transition-all
              duration-200
              ${
                draggingSongId === item.id && draggingFrom === "library"
                  ? "bg-emerald-600/30 scale-[0.98]"
                  : "hover:bg-neutral-800/40 hover:scale-[1.01]"
              }
            `}
          >
            <MediaItem onClick={(id: string) => onPlay(id)} data={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
