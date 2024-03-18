import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from '../../src/components/ProductForm';
import { Category } from '../../src/entities';
import AllProviders from '../AllProviders';
import { db } from '../mocks/db';

describe('ProductForm', () => {
    const categories: Category[] = [];

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const category = db.category.create();
            categories.push(category);
        });
    });

    afterAll(() => {
        db.category.deleteMany({
            where: { id: { in: categories.map((c) => c.id) } },
        });
    });

    const renderComponent = () => {
        const onSubmit = vi.fn();
        render(<ProductForm onSubmit={onSubmit} />, { wrapper: AllProviders });
    };

    it('should render form fields', async () => {
        renderComponent();
        await screen.findByRole('form');

        const nameInput = screen.getByPlaceholderText(/name/i);
        expect(nameInput).toBeInTheDocument();
        const priceInput = screen.getByPlaceholderText(/price/i);
        expect(priceInput).toBeInTheDocument();
        const combobox = screen.getByRole('combobox', { name: /category/i });
        expect(combobox).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(combobox);
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(3);
        categories.forEach((c) => {
            const option = screen.getByRole('option', { name: c.name });
            expect(option).toBeInTheDocument();
        });
    });
});
