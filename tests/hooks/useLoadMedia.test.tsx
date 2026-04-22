import { renderHook } from '@testing-library/react';
import useLoadImage from '@/hooks/useLoadImage';
import useLoadSongUrl from '@/hooks/useLoadSongUrl';
import type { Song } from '@/types';

const mockGetPublicUrl = vi.fn();
const mockFrom = vi.fn(() => ({ getPublicUrl: mockGetPublicUrl }));

vi.mock('@/providers/SupabaseProvider', () => ({
    useSupabase: () => ({ storage: { from: mockFrom } }),
}));

const song: Song = { id: '1', user_id: 'user-1', author: 'Author', title: 'Title', song_path: 'songs/test.mp3', image_path: 'images/test.png' };

describe('media loading hooks', () => {
    beforeEach(() => {
        mockGetPublicUrl.mockReset();
        mockFrom.mockClear();
    });

    it('returns the fallback image for a missing song', () => {
        const { result } = renderHook(() => useLoadImage(null));
        expect(result.current).toBe('/images/liked_.png');
    });

    it('returns the public image url for a valid song', () => {
        mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/image.png' } });
        const { result } = renderHook(() => useLoadImage(song));
        expect(mockFrom).toHaveBeenCalledWith('images');
        expect(mockGetPublicUrl).toHaveBeenCalledWith('images/test.png');
        expect(result.current).toBe('https://cdn/image.png');
    });

    it('returns an empty string for a missing audio source', () => {
        const { result } = renderHook(() => useLoadSongUrl(null));
        expect(result.current).toBe('');
    });

    it('returns the public audio url for a valid song', () => {
        mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/song.mp3' } });
        const { result } = renderHook(() => useLoadSongUrl(song));
        expect(mockFrom).toHaveBeenCalledWith('songs');
        expect(mockGetPublicUrl).toHaveBeenCalledWith('songs/test.mp3');
        expect(result.current).toBe('https://cdn/song.mp3');
    });
});
