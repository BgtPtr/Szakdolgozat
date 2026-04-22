import { render, screen } from '@testing-library/react';
import Player from '@/components/Player';

const mockUsePlayer = vi.fn();
const mockUseGetSongById = vi.fn();
const mockUseLoadSongUrl = vi.fn();

vi.mock('@/hooks/usePlayer', () => ({ default: () => mockUsePlayer() }));
vi.mock('@/hooks/useGetSongById', () => ({ default: (id?: string) => mockUseGetSongById(id) }));
vi.mock('@/hooks/useLoadSongUrl', () => ({ default: (song: unknown) => mockUseLoadSongUrl(song) }));
vi.mock('@/components/PlayerContent', () => ({
    default: ({ song, songUrl }: { song: { title: string }; songUrl: string }) => <div data-testid="player-content">{song.title} - {songUrl}</div>,
}));

describe('Player', () => {
    beforeEach(() => {
        mockUsePlayer.mockReset();
        mockUseGetSongById.mockReset();
        mockUseLoadSongUrl.mockReset();
    });

    it('renders nothing when there is no active song', () => {
        mockUsePlayer.mockReturnValue({ activeId: undefined });
        mockUseGetSongById.mockReturnValue({ song: undefined });
        mockUseLoadSongUrl.mockReturnValue('');
        const { container } = render(<Player />);
        expect(container.firstChild).toBeNull();
    });

    it('renders PlayerContent when song and url are available', () => {
        mockUsePlayer.mockReturnValue({ activeId: 'song-1' });
        mockUseGetSongById.mockReturnValue({ song: { id: 'song-1', title: 'Song title' } });
        mockUseLoadSongUrl.mockReturnValue('https://cdn/song.mp3');
        render(<Player />);
        expect(screen.getByTestId('player-content')).toHaveTextContent('Song title - https://cdn/song.mp3');
    });
});
