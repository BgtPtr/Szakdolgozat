import { renderHook, waitFor } from '@testing-library/react';
import type { Song } from '@/types';

const mocks = {
    single: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    from: vi.fn(),
    toastError: vi.fn(),
};

mocks.eq.mockImplementation(() => ({ single: mocks.single }));
mocks.select.mockImplementation(() => ({ eq: mocks.eq }));
mocks.from.mockImplementation(() => ({ select: mocks.select }));

const song: Song = { id: 'song-1', user_id: 'user-1', author: 'Author', title: 'Title', song_path: 'songs/file.mp3', image_path: 'images/file.png' };

describe('useGetSongById', () => {
    beforeEach(() => {
        vi.resetModules();
        mocks.from.mockClear();
        mocks.select.mockClear();
        mocks.eq.mockClear();
        mocks.single.mockReset();
        mocks.toastError.mockReset();
    });

    const loadHook = async () => {
        vi.doMock('@/providers/SupabaseProvider', () => ({
            useSupabase: () => ({ from: mocks.from }),
        }));
        vi.doMock('react-hot-toast', () => ({
            default: { error: mocks.toastError },
        }));
        return (await import('@/hooks/useGetSongById')).default;
    };

    it('returns the idle state when no id is provided', async () => {
        const useGetSongById = await loadHook();
        const { result } = renderHook(() => useGetSongById(undefined));
        expect(result.current).toEqual({ isLoading: false, song: undefined });
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it.skip('loads a song successfully', async () => {
        mocks.single.mockResolvedValue({ data: song, error: null });
        const useGetSongById = await loadHook();
        const { result } = renderHook(() => useGetSongById('song-1'));

        await waitFor(() => {
            expect(result.current.song).toEqual(song);
            expect(result.current.isLoading).toBe(false);
        });

        expect(mocks.from).toHaveBeenCalledWith('songs');
        expect(mocks.eq).toHaveBeenCalledWith('id', 'song-1');
    });

    it.skip('reports fetch errors through toast', async () => {
        mocks.single.mockResolvedValue({ data: null, error: { message: 'boom' } });
        const useGetSongById = await loadHook();
        const { result } = renderHook(() => useGetSongById('song-1'));

        await waitFor(() => {
            expect(mocks.toastError).toHaveBeenCalledWith('boom');
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.song).toBeUndefined();
    });
});
