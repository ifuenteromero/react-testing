import { render, screen } from '@testing-library/react';
import ToastDemo from '../../src/components/ToastDemo';
import { Toaster } from 'react-hot-toast';
import userEvent from '@testing-library/user-event';

describe('ToastDemos', () => {
    const renderComponent = () => {
        render(
            <>
                <ToastDemo />
                <Toaster />
            </>
        );

        return {
            button: screen.getByRole('button'),
        };
    };
    it('should render a toast when button is clicked', async () => {
        const { button } = renderComponent();
        const user = userEvent.setup();
        await user.click(button);

        const toast = await screen.findByText(/success/i);

        expect(toast).toBeInTheDocument();
    });
});
