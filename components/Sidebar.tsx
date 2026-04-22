"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { twMerge } from "tailwind-merge";

import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";

import Player from "./Player";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@/hooks/useUser";
import type { Song } from "@/types";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar: React.FC<SidebarProps> = ({ children, songs }) => {
  const pathname = usePathname();
  const player = usePlayer();
  const { user } = useUser();
  const isGuest = !user;

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Kezdőlap",
        active: pathname !== "/search",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Keresés",
        active: pathname === "/search",
        href: "/search",
      },
    ],
    [pathname]
  );

  const handleResizeMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing || isGuest) return;

    const handleMouseMove = (event: MouseEvent) => {
      const min = 220;
      const max = 420;
      const newWidth = Math.min(Math.max(event.clientX, min), max);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isGuest]);

  return (
    <div className="h-full flex">
      {!isGuest && (
        <>
          <div
            className={twMerge(
              `
                hidden
                md:flex
                flex-col
                gap-y-2
                bg-black
                h-full
                p-2
              `,
              player.activeId && "h-[calc(100%-80px)]"
            )}
            style={{ width: sidebarWidth }}
          >
            <Box>
              <div className="flex flex-col gap-y-4 px-5 py-4">
                {routes.map((item) => (
                  <SidebarItem key={item.label} {...item} />
                ))}
              </div>
            </Box>

            <Box className="overflow-y-auto h-full">
              <Library songs={songs} />
            </Box>
          </div>

          <div
            onMouseDown={handleResizeMouseDown}
            className="
              hidden
              md:block
              w-[3px]
              cursor-col-resize
              bg-neutral-900
              hover:bg-[#d6d31a]
              transition-colors
            "
          />
        </>
      )}

      <main
        className={twMerge(
          `
            h-full
            flex-1
            overflow-y-auto
            py-2
          `,
          !isGuest && player.activeId && "h-[calc(100%-80px)]"
        )}
      >
        {children}
      </main>

      {!isGuest && player.activeId && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-black">
          <Player />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
