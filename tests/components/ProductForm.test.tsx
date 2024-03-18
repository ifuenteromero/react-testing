import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from '../../src/components/ProductForm';
import { Category, Product } from '../../src/entities';
import AllProviders from '../AllProviders';
import { db } from '../mocks/db';

describe('ProductForm', () => {
    const categories: Category[] = [];
    let product: Product;

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const category = db.category.create();
            categories.push(category);
        });
        product = db.product.create({ categoryId: categories[0].id });
    });

    afterAll(() => {
        db.category.deleteMany({
            where: { id: { in: categories.map((c) => c.id) } },
        });
        db.product.delete({ where: { id: { equals: product.id } } });
    });

    const renderComponent = () => {
        const onSubmit = vi.fn();

        render(<ProductForm product={product} onSubmit={onSubmit} />, {
            wrapper: AllProviders,
        });

        const user = userEvent.setup();

        return {
            getNameInput: () => screen.getByPlaceholderText(/name/i),
            getPriceInput: () => screen.getByPlaceholderText(/price/i),
            getCombobox: () =>
                screen.getByRole('combobox', { name: /category/i }),
            user,
            getForm: async () => await screen.findByRole('form'),
        };
    };

    it('should render form fields', async () => {
        const { getNameInput, getPriceInput, getCombobox, user, getForm } =
            renderComponent();
        await getForm();
        const nameInput = getNameInput();
        expect(nameInput).toBeInTheDocument();
        const priceInput = getPriceInput();
        expect(priceInput).toBeInTheDocument();
        const combobox = getCombobox();
        expect(combobox).toBeInTheDocument();

        await user.click(combobox);
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(3);
        categories.forEach((c) => {
            const option = screen.getByRole('option', { name: c.name });
            expect(option).toBeInTheDocument();
        });
    });

    it('should populate form fields when editing a product', async () => {
        const { getForm, getNameInput, getPriceInput, getCombobox } =
            renderComponent();
        await getForm();

        const nameInput = getNameInput();
        expect(nameInput).toHaveValue(product.name);
        const priceInput = getPriceInput();
        expect(priceInput).toHaveValue(product.price.toString());
        const category = categories[0];
        const combobox = getCombobox();
        expect(combobox).toHaveTextContent(category.name);
    });
});
