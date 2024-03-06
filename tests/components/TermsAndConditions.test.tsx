import { render, screen } from '@testing-library/react';
import TermsAndConditions from '../../src/components/TermsAndConditions';
import userEvent from '@testing-library/user-event';

describe('TermsAndConditions', () => {
    it('should render with correct text and initial state', () => {
        render(<TermsAndConditions />);

        const heading = screen.getByRole('heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Terms & Conditions');

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();

        const button = screen.getByRole('button', { name: /submit/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('should enable the button when the checkbox is checked and disable it when is unchecked', async () => {
        render(<TermsAndConditions />);

        const checkbox = screen.getByRole('checkbox');
        const button = screen.getByRole('button', { name: /submit/i });

        const user = userEvent.setup();
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(button).toBeEnabled();

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(button).toBeDisabled();
    });
});
