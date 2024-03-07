import { render, screen } from '@testing-library/react';
import OrderStatusSelector from '../../src/components/OrderStatusSelector';
import { Theme } from '@radix-ui/themes';
import userEvent from '@testing-library/user-event';

const options = {
    new: {
        label: 'New',
        value: 'new',
        regex: /new/i,
    },
    processed: {
        label: 'Processed',
        value: 'processed',
        regex: /processed/i,
    },
    fulfilled: {
        label: 'Fulfilled',
        value: 'fulfilled',
        regex: /fulfilled/i,
    },
};

describe('OrderStatusSelector', () => {
    const renderComponent = () => {
        const onChange = vi.fn();
        render(
            <Theme>
                <OrderStatusSelector onChange={onChange} />
            </Theme>
        );
        const user = userEvent.setup();
        return {
            trigger: screen.getByRole('combobox'),
            getOptions: () => screen.findAllByRole('option'),
            user,
            onChange,
            getOption: (label: RegExp) =>
                screen.findByRole('option', { name: label }),
        };
    };

    it('should render New as the default value', () => {
        const { trigger } = renderComponent();

        expect(trigger).toHaveTextContent(options.new.label);
    });

    it('should render correct statuses', async () => {
        const { trigger, getOptions, user } = renderComponent();

        await user.click(trigger);

        const optionss = await getOptions();
        const textOptions = optionss.map((option) => option.textContent);

        expect(textOptions).toHaveLength(3);
        expect(textOptions).toEqual([
            options.new.label,
            options.processed.label,
            options.fulfilled.label,
        ]);
    });

    it("should call onChange with 'processed' when the Processed option is selected", async () => {
        const { trigger, getOption, user, onChange } = renderComponent();

        await user.click(trigger);

        const processedOption = await getOption(options.processed.regex);
        await user.click(processedOption);

        expect(onChange).toHaveBeenCalledWith(options.processed.value);
    });

    it("should call onChange with 'fulfilled' when the Fulfilled option is selected", async () => {
        const { trigger, getOption, user, onChange } = renderComponent();

        await user.click(trigger);

        const fulfilledOption = await getOption(options.fulfilled.regex);
        await user.click(fulfilledOption);

        expect(onChange).toHaveBeenCalledWith(options.fulfilled.value);
    });

    it.each([options.processed, options.fulfilled])(
        'Each should call onChange with $value when the $label option is selected',
        async ({ regex, value }) => {
            const { trigger, getOption, user, onChange } = renderComponent();

            await user.click(trigger);

            const processedOption = await getOption(regex);
            await user.click(processedOption);

            expect(onChange).toHaveBeenCalledWith(value);
        }
    );

    it("should call onChange with 'new' when the 'New' option is selected", async () => {
        const { trigger, getOption, user, onChange } = renderComponent();

        await user.click(trigger);

        const processedOption = await getOption(options.processed.regex);
        await user.click(processedOption);
        await user.click(trigger);
        const newOption = await getOption(options.new.regex);
        await user.click(newOption);

        expect(onChange).toHaveBeenCalledWith('new');
    });
});
