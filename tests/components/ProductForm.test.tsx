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

    const renderComponent = (product?: Product) => {
        const onSubmit = vi.fn();

        render(<ProductForm product={product} onSubmit={onSubmit} />, {
            wrapper: AllProviders,
        });

        const user = userEvent.setup();

        return {
            user,
            waitForFormToLoad: async () => {
                await screen.findByRole('form');
                return {
                    nameInput: screen.getByPlaceholderText(/name/i),
                    priceInput: screen.getByPlaceholderText(/price/i),
                    categoriesInput: screen.getByRole('combobox', {
                        name: /category/i,
                    }),
                    submitButton: screen.getByRole('button', {
                        name: /submit/i,
                    }),
                };
            },
        };
    };

    it('should render form fields', async () => {
        const { user, waitForFormToLoad } = renderComponent();
        const { nameInput, priceInput, categoriesInput } =
            await waitForFormToLoad();
        expect(nameInput).toBeInTheDocument();
        expect(priceInput).toBeInTheDocument();
        expect(categoriesInput).toBeInTheDocument();

        await user.click(categoriesInput);
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(3);
        categories.forEach((c) => {
            const option = screen.getByRole('option', { name: c.name });
            expect(option).toBeInTheDocument();
        });
    });

    it('should populate form fields when editing a product', async () => {
        const { waitForFormToLoad } = renderComponent(product);
        const { nameInput, priceInput, categoriesInput } =
            await waitForFormToLoad();

        expect(nameInput).toHaveValue(product.name);
        expect(priceInput).toHaveValue(product.price.toString());
        const category = categories[0];
        expect(categoriesInput).toHaveTextContent(category.name);
    });

    it('should put focus on the name field', async () => {
        const { waitForFormToLoad } = renderComponent();
        const { nameInput } = await waitForFormToLoad();

        expect(nameInput).toHaveFocus();
    });

    it('should display an error if name is missing', async () => {
        const { waitForFormToLoad, user } = renderComponent();
        const { priceInput, categoriesInput, submitButton } =
            await waitForFormToLoad();

        await user.type(priceInput, '10');
        await user.click(categoriesInput);
        const options = screen.getAllByRole('option');
        const option = options[0];
        await user.click(option);
        await user.click(submitButton);

        const error = screen.getByRole('alert');
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent(/name/i);
        expect(error).toHaveTextContent(/required/i);
    });
});
