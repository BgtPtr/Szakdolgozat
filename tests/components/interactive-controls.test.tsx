import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FiHome } from "react-icons/fi";
import * as nextNavigation from "next/navigation";
import toast from "react-hot-toast";

import DeleteSongButton from "@/components/DeleteSongButton";
import Input from "@/components/Input";
import ListItem from "@/components/ListItem";
import SidebarItem from "@/components/SidebarItem";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock("next/image", () => ({
    default: ({ fill: _fill, alt = "", ...props }: any) => (
        <img alt={alt} {...props} />
    ),
}));

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("interactive UI controls", () => {
    const pushMock = vi.fn();
    const refreshMock = vi.fn();
    const replaceMock = vi.fn();

    beforeEach(() => {
        pushMock.mockReset();
        refreshMock.mockReset();
        replaceMock.mockReset();

        vi.mocked(nextNavigation.useRouter).mockReturnValue({
            push: pushMock,
            refresh: refreshMock,
            replace: replaceMock,
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
        } as any);

        vi.mocked(toast.success).mockReset();
        vi.mocked(toast.error).mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("renders Input with text type by default", () => {
        render(<Input placeholder="Keresés" />);
        expect(screen.getByPlaceholderText("Keresés")).toHaveAttribute("type", "text");
    });

    it("renders SidebarItem with href and active styling", () => {
        render(<SidebarItem icon={FiHome} label="Kezdőlap" href="/" active />);
        const link = screen.getByRole("link", { name: /kezdőlap/i });

        expect(link).toHaveAttribute("href", "/");
        expect(link.className).toContain("text-white");
    });

    it("navigates to the given href when ListItem is clicked", () => {
        render(<ListItem image="/cover.png" name="Kedvencek" href="/liked" />);
        fireEvent.click(screen.getByRole("button", { name: /kedvencek/i }));

        expect(pushMock).toHaveBeenCalledWith("/liked");
    });

    it("does not call the delete endpoint when the confirmation is cancelled", () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(<DeleteSongButton songId="song-1" />);
        fireEvent.click(screen.getByRole("button", { name: /dal törlése/i }));

        expect(fetchMock).not.toHaveBeenCalled();
        expect(refreshMock).not.toHaveBeenCalled();
    });

    it("calls the delete endpoint and refreshes the page after a successful deletion", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<DeleteSongButton songId="song-42" />);
        fireEvent.click(screen.getByRole("button", { name: /dal törlése/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/songs/song-42", {
                method: "DELETE",
            });
            expect(toast.success).toHaveBeenCalledWith("A dal sikeresen törölve.");
            expect(refreshMock).toHaveBeenCalled();
        });
    });

    it("shows an error toast when the delete request fails", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Törlés sikertelen" }),
        });

        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<DeleteSongButton songId="song-99" />);
        fireEvent.click(screen.getByRole("button", { name: /dal törlése/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Törlés sikertelen");
            expect(refreshMock).not.toHaveBeenCalled();
        });
    });
});