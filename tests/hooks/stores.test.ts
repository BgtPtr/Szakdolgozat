import useAuthModal from '@/hooks/useAuthModal';
import useLikedSongs from '@/hooks/useLikedSongs';
import usePlayer from '@/hooks/usePlayer';
import useUploadModal from '@/hooks/useUploadModal';

describe('zustand stores', () => {
    beforeEach(() => {
        usePlayer.getState().reset();
        useAuthModal.setState({ isOpen: false, view: 'sign_in' });
        useUploadModal.setState({ isOpen: false });
        useLikedSongs.setState({ likedSongIds: [] });
    });

    it('stores the active song and playing state', () => {
        usePlayer.getState().setId('song-1');
        usePlayer.getState().setIds(['song-1', 'song-2']);
        usePlayer.getState().setIsPlaying(true);
        expect(usePlayer.getState().activeId).toBe('song-1');
        expect(usePlayer.getState().ids).toEqual(['song-1', 'song-2']);
        expect(usePlayer.getState().isPlaying).toBe(true);
    });

    it('resets the player store', () => {
        usePlayer.setState({ ids: ['a'], activeId: 'a', isPlaying: true });
        usePlayer.getState().reset();
        expect(usePlayer.getState()).toMatchObject({ ids: [], activeId: undefined, isPlaying: false });
    });

    it('opens and closes the auth modal in sign-in mode', () => {
        useAuthModal.getState().openSignIn();
        expect(useAuthModal.getState()).toMatchObject({ isOpen: true, view: 'sign_in' });
        useAuthModal.getState().onClose();
        expect(useAuthModal.getState().isOpen).toBe(false);
    });

    it('opens the auth modal in sign-up mode', () => {
        useAuthModal.getState().openSignUp();
        expect(useAuthModal.getState()).toMatchObject({ isOpen: true, view: 'sign_up' });
    });

    it('opens and closes the upload modal', () => {
        useUploadModal.getState().onOpen();
        expect(useUploadModal.getState().isOpen).toBe(true);
        useUploadModal.getState().onClose();
        expect(useUploadModal.getState().isOpen).toBe(false);
    });

    it('adds and removes liked song ids without duplicates', () => {
        const { setLikedState } = useLikedSongs.getState();
        setLikedState('song-1', true);
        setLikedState('song-1', true);
        setLikedState('song-2', true);
        expect(useLikedSongs.getState().likedSongIds).toEqual(['song-1', 'song-2']);
        setLikedState('song-1', false);
        expect(useLikedSongs.getState().likedSongIds).toEqual(['song-2']);
    });
});
