import { act, renderHook } from '@testing-library/react';
import useDebounce from '@/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('returns the initial value immediately', () => {
        const { result } = renderHook(({ value }) => useDebounce(value, 200), { initialProps: { value: 'initial' } });
        expect(result.current).toBe('initial');
    });

    it('updates only after the given delay', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), { initialProps: { value: 'first' } });
        rerender({ value: 'second' });
        expect(result.current).toBe('first');
        act(() => vi.advanceTimersByTime(199));
        expect(result.current).toBe('first');
        act(() => vi.advanceTimersByTime(1));
        expect(result.current).toBe('second');
    });

    it('cancels the previous timer when the value changes again', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), { initialProps: { value: 'a' } });
        rerender({ value: 'b' });
        act(() => vi.advanceTimersByTime(100));
        rerender({ value: 'c' });
        act(() => vi.advanceTimersByTime(100));
        expect(result.current).toBe('a');
        act(() => vi.advanceTimersByTime(100));
        expect(result.current).toBe('c');
    });
});
