import { act, fireEvent, render, screen } from "@testing-library/react";
import SearchInput from "@/components/SearchInput";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace,
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe("SearchInput", () => {
    beforeEach(() => {
        replace.mockReset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("replaces the default empty search on mount", () => {
        render(<SearchInput />);

        expect(replace).toHaveBeenCalledWith("/search");
    });

    it("replaces the debounced search value after typing", () => {
        render(<SearchInput />);

        fireEvent.change(screen.getByPlaceholderText("Mit hallgatnál?"), {
            target: { value: "metallica" },
        });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(replace).toHaveBeenLastCalledWith("/search?title=metallica");
    });
});