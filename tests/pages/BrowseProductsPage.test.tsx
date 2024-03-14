import { Theme } from '@radix-ui/themes';
import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Category, Product } from '../../src/entities';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import { CartProvider } from '../../src/providers/CartProvider';
import { db } from '../mocks/db';
import { simulateDelay, simulateError } from '../utils';

describe('BrowseProductsPage', () => {
    const categories: Category[] = [];
    const products: Product[] = [];

    beforeAll(() => {
        [1, 2, 3].forEach((item) => {
            const category = db.category.create({ name: 'Category' + item });
            categories.push(category);
            const product = db.product.create();
            products.push(product);
        });
    });

    afterAll(() => {
        const categoryIds = categories.map((c) => c.id);
        db.category.deleteMany({ where: { id: { in: categoryIds } } });
        const productIds = products.map((p) => p.id);
        db.product.deleteMany({ where: { id: { in: productIds } } });
    });

    const renderComponent = () => {
        render(
            <CartProvider>
                <Theme>
                    <BrowseProducts />
                </Theme>
            </CartProvider>
        );

        return {
            getProductsSkeleton: () =>
                screen.queryAllByRole('cell', {
                    name: /product/i,
                }),

            getCategoriesSkeleton: () =>
                screen.queryByRole('progressbar', {
                    name: /categories/i,
                }),
            getCategoriesCombobox: () => screen.queryByRole('combobox'),
        };
    };

    it('should render a loading skeleton when fetching categories', () => {
        simulateDelay('/categories');
        const { getCategoriesSkeleton } = renderComponent();
        const categoriesSkeleton = getCategoriesSkeleton();
        expect(categoriesSkeleton).toBeInTheDocument();
    });

    it('should hide the loading skeleton after categories are fetched', async () => {
        const { getCategoriesSkeleton } = renderComponent();
        await waitForElementToBeRemoved(getCategoriesSkeleton);
    });

    it('should render a loading skeleton when fetching products', () => {
        simulateDelay('/products');

        const { getProductsSkeleton } = renderComponent();
        const productsSkeleton = getProductsSkeleton();
        expect(productsSkeleton).toHaveLength(15);
    });

    it('should hide the loading skeleton after products are fetched', async () => {
        const { getProductsSkeleton } = renderComponent();
        await waitForElementToBeRemoved(getProductsSkeleton);
    });

    it('should not render an error if categories cannot be fetched', async () => {
        simulateError('/categories');
        const { getCategoriesSkeleton, getCategoriesCombobox } =
            renderComponent();
        await waitForElementToBeRemoved(getCategoriesSkeleton);
        const error = screen.queryByText(/error/i);
        const combobox = getCategoriesCombobox();
        expect(error).not.toBeInTheDocument();
        expect(combobox).not.toBeInTheDocument();
    });

    it('should render an error if products cannot be fetched', async () => {
        simulateError('/products');
        renderComponent();
        const error = await screen.findByText(/error/i);
        expect(error).toBeInTheDocument();
    });

    it('should render categories', async () => {
        const { getCategoriesSkeleton, getCategoriesCombobox } =
            renderComponent();
        await waitForElementToBeRemoved(getCategoriesSkeleton);
        const combobox = getCategoriesCombobox();
        expect(combobox).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(combobox!);

        const options = await screen.findAllByRole('option');
        expect(options.length).toBeGreaterThan(0);

        categories.forEach((c) => {
            const category = screen.getByRole('option', { name: c.name });
            expect(category).toBeInTheDocument();
        });

        const allOption = screen.getByRole('option', { name: /all/i });
        expect(allOption).toBeInTheDocument();
    });

    it('should render products', async () => {
        const { getProductsSkeleton } = renderComponent();
        await waitForElementToBeRemoved(getProductsSkeleton);

        products.forEach((p) => {
            const productName = screen.getByRole('cell', { name: p.name });
            const productPrice = screen.getByText(
                new RegExp(p.price.toString())
            );
            expect(productName).toBeInTheDocument();
            expect(productPrice).toBeInTheDocument();
        });
    });
});
