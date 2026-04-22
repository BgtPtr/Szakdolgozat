import { render, screen } from '@testing-library/react';
import Box from '@/components/Box';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PlayButton from '@/components/PlayButton';

describe('basic reusable components', () => {
    it('renders Button content and disabled state', () => {
        render(<Button disabled className="custom-class">Save</Button>);
        const button = screen.getByRole('button', { name: 'Save' });
        expect(button).toBeDisabled();
        expect(button).toHaveClass('custom-class');
    });

    it('renders Input with the provided type and placeholder', () => {
        render(<Input type="email" placeholder="Email" />);
        const input = screen.getByPlaceholderText('Email');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders Box children and custom classes', () => {
        const { container } = render(<Box className="extra-box-class">Library</Box>);
        expect(screen.getByText('Library')).toBeInTheDocument();
        expect(container.firstElementChild).toHaveClass('extra-box-class');
    });

    it('renders PlayButton as an accessible button', () => {
        render(<PlayButton />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
