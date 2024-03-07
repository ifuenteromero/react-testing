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
        const user = userEvent.setup();
        return {
            trigger: screen.getByRole('combobox'),
            getOptions: () => screen.findAllByRole('option'),
            user,
        };
    };

    it('should render New as the default value', () => {
        const { trigger } = renderComponent();

        expect(trigger).toHaveTextContent(/new/i);
    });

    it('should render correct statuses', async () => {
        const { trigger, getOptions, user } = renderComponent();

        await user.click(trigger);

        const options = await getOptions();
        const textOptions = options.map((option) => option.textContent);

        expect(textOptions).toHaveLength(3);
        expect(textOptions).toEqual(['New', 'Processed', 'Fulfilled']);
    });
});
