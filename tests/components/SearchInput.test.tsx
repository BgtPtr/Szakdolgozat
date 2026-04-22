import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchInput from '@/components/SearchInput';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

describe('SearchInput', () => {
    beforeEach(() => {
        push.mockReset();
        vi.useFakeTimers();
    });
    afterEach(() => vi.useRealTimers());

    it('pushes the default empty search on mount', () => {
        render(<SearchInput />);
        expect(push).toHaveBeenCalledWith('/search?title=');
    });

    it('pushes the debounced search value after typing', () => {
        render(<SearchInput />);
        fireEvent.change(screen.getByPlaceholderText('Mit hallgatnál?'), { target: { value: 'metallica' } });
        act(() => vi.advanceTimersByTime(200));
        expect(push).toHaveBeenLastCalledWith('/search?title=metallica');
    });
});
