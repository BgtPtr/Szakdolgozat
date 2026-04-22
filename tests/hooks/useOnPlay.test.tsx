import { act, renderHook } from '@testing-library/react';
import useOnPlay from '@/hooks/useOnPlay';
import useAuthModal from '@/hooks/useAuthModal';
import usePlayer from '@/hooks/usePlayer';
import type { Song } from '@/types';

const mockUseUser = vi.fn();
vi.mock('@/hooks/useUser', () => ({ useUser: () => mockUseUser() }));

const songs: Song[] = [
    { id: 'song-1', user_id: 'user-1', author: 'Author 1', title: 'Title 1', song_path: 'a.mp3', image_path: 'a.png' },
    { id: 'song-2', user_id: 'user-1', author: 'Author 2', title: 'Title 2', song_path: 'b.mp3', image_path: 'b.png' },
];

describe('useOnPlay', () => {
    beforeEach(() => {
        usePlayer.getState().reset();
        useAuthModal.setState({ isOpen: false, view: 'sign_in', openSignIn: vi.fn(), openSignUp: vi.fn(), onClose: vi.fn() });
    });

    it('opens the sign-in modal when there is no authenticated user', () => {
        mockUseUser.mockReturnValue({ user: null });
        const { result } = renderHook(() => useOnPlay(songs));
        act(() => result.current('song-1'));
        expect(useAuthModal.getState().openSignIn).toHaveBeenCalled();
        expect(usePlayer.getState().activeId).toBeUndefined();
    });

    it('sets the active song and playlist ids for authenticated users', () => {
        mockUseUser.mockReturnValue({ user: { id: 'user-1' } });
        const { result } = renderHook(() => useOnPlay(songs));
        act(() => result.current('song-2'));
        expect(usePlayer.getState().activeId).toBe('song-2');
        expect(usePlayer.getState().ids).toEqual(['song-1', 'song-2']);
    });
});
