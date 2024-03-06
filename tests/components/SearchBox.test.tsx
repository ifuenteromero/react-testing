import { render, screen } from '@testing-library/react';
import SearchBox from '../../src/components/SearchBox';
import userEvent from '@testing-library/user-event';

describe('SearchBox', () => {
    const renderComponent = () => {
        const onChange = vi.fn();
        render(<SearchBox onChange={onChange} />);
        const user = userEvent.setup();
        return {
            input: screen.getByPlaceholderText(/search/i),
            onChange,
            user,
        };
    };
    it('should render an input field for searching', () => {
        const { input } = renderComponent();
        expect(input).toBeInTheDocument();
    });

    it('should call onChange when Enter is pressed', async () => {
        const { input, onChange, user } = renderComponent();

        const searchTerm = 'hola';
        await user.type(input, searchTerm + '{enter}');

        expect(onChange).toHaveBeenCalledWith(searchTerm);
    });

    it('should not call onChange if input field is empty', async () => {
        const { input, onChange, user } = renderComponent();

        await user.type(input, '{enter}');

        expect(onChange).not.toHaveBeenCalled();
    });
});
