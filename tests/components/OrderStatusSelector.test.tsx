import { render, screen } from '@testing-library/react';
import OrderStatusSelector from '../../src/components/OrderStatusSelector';
import { Theme } from '@radix-ui/themes';
import userEvent from '@testing-library/user-event';

describe('OrderStatusSelector', () => {
    const renderComponent = () => {
        render(
            <Theme>
                <OrderStatusSelector onChange={vi.fn()} />
            </Theme>
        );
        return {
            trigger: screen.getByRole('combobox'),
        };
    };

    it('should render New as the default value', () => {
        const { trigger } = renderComponent();

        expect(trigger).toHaveTextContent(/new/i);
    });

    it('should render correct statuses', async () => {
        const { trigger } = renderComponent();

        const user = userEvent.setup();
        await user.click(trigger);

        const options = await screen.findAllByRole('option');
        const textOptions = options.map((option) => option.textContent);

        expect(textOptions).toHaveLength(3);
        expect(textOptions).toEqual(['New', 'Processed', 'Fulfilled']);
    });
});
