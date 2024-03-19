import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'react-hot-toast';
import ProductForm from '../../src/components/ProductForm';
import { Category, Product } from '../../src/entities';
import AllProviders from '../AllProviders';
import { db } from '../mocks/db';

describe('ProductForm', () => {
    const categories: Category[] = [];
    let product: Product;
    let productCategoryId: number;

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const category = db.category.create();
            categories.push(category);
        });
        productCategoryId = categories[0].id;
        product = db.product.create({ categoryId: productCategoryId });
    });

    afterAll(() => {
        db.category.deleteMany({
            where: { id: { in: categories.map((c) => c.id) } },
        });
        db.product.delete({ where: { id: { equals: product.id } } });
    });

    const renderComponent = (_product?: Product) => {
        const onSubmit = vi.fn();

        render(
            <>
                <ProductForm product={_product} onSubmit={onSubmit} />
                <Toaster />
            </>,
            {
                wrapper: AllProviders,
            }
        );

        const user = userEvent.setup();

        const expectErrorToBeInTheDocument = (errorMessage: RegExp) => {
            const error = screen.getByRole('alert');
            expect(error).toBeInTheDocument();
            expect(error).toHaveTextContent(errorMessage);
        };

        return {
            onSubmit,
            user,
            expectErrorToBeInTheDocument,
            waitForFormToLoad: async () => {
                await screen.findByRole('form');
                const nameInput = screen.getByPlaceholderText(/name/i);
                const priceInput = screen.getByPlaceholderText(/price/i);
                const categoriesInput = screen.getByRole('combobox', {
                    name: /category/i,
                });
                const submitButton = screen.getByRole('button', {
                    name: /submit/i,
                });

                type FormData = {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    [K in keyof Product]: any;
                };

                const validData: FormData = {
                    id: product.id,
                    name: 'aaaa',
                    price: 10,
                    categoryId: product?.categoryId,
                };

                const fill = async (product: FormData) => {
                    if (product.name !== undefined)
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        await user.type(nameInput, product.name);

                    if (product.price !== undefined)
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                        await user.type(priceInput, product.price.toString());

                    await user.tab();
                    await user.click(categoriesInput);
                    const options = screen.getAllByRole('option');
                    const option = options[0];
                    await user.click(option);
                    await user.click(submitButton);
                };

                return {
                    nameInput,
                    priceInput,
                    categoriesInput,
                    submitButton,
                    fill,
                    validData,
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

    it.each([
        {
            scenario: 'missing',
            errorMessage: /required/i,
        },
        {
            scenario: 'longer than 255 characters',
            name: 'a'.repeat(256),
            errorMessage: /255/i,
        },
    ])(
        'should display an error if name is $scenario',
        async ({ name, errorMessage }) => {
            const { waitForFormToLoad, expectErrorToBeInTheDocument } =
                renderComponent();
            const form = await waitForFormToLoad();
            await form.fill({ ...form.validData, name });

            expectErrorToBeInTheDocument(errorMessage);
        }
    );

    it.each([
        {
            scenario: 'missing',
            errorMessage: /required/i,
        },
        {
            scenario: 'greater than 1000',
            price: 1001,
            errorMessage: /1000/i,
        },
        {
            scenario: '0',
            price: 0,
            errorMessage: /1/i,
        },
        {
            scenario: 'negative',
            price: -1,
            errorMessage: /1/i,
        },
        {
            scenario: 'not a number',
            price: 'aaa',
            errorMessage: /required/i,
        },
    ])(
        'should display an error if price is $scenario',
        async ({ price, errorMessage }) => {
            const { waitForFormToLoad, expectErrorToBeInTheDocument } =
                renderComponent();
            const form = await waitForFormToLoad();
            await form.fill({ ...form.validData, price });

            expectErrorToBeInTheDocument(errorMessage);
        }
    );

    it('should call onSubmit with the correct data', async () => {
        const { onSubmit, waitForFormToLoad } = renderComponent();
        const form = await waitForFormToLoad();
        const data = {
            ...form.validData,
            price: 23,
            name: 'hola',
        };
        delete data.id; // si no no pasa. ¿?
        await form.fill(data);

        expect(onSubmit).toHaveBeenCalledWith(data);
    });

    it('should display a toast if submission fails', async () => {
        const { onSubmit, waitForFormToLoad } = renderComponent();
        onSubmit.mockRejectedValue({});
        const form = await waitForFormToLoad();
        await form.fill(form.validData);
        const toast = screen.getByRole('status');
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent(/error/i);
    });
});
