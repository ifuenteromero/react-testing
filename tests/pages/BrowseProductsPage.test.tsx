import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import { Theme } from '@radix-ui/themes';
import { server } from '../mocks/server';
import { HttpResponse, delay, http } from 'msw';
import userEvent from '@testing-library/user-event';
import { db } from '../mocks/db';
import { Category, Product } from '../../src/entities';
import { CartProvider } from '../../src/providers/CartProvider';

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
    };

    it('should render a loading skeleton when fetching categories', () => {
        server.use(
            http.get('/categories', async () => {
                await delay();
                return HttpResponse.json([]);
            })
        );
        renderComponent();
        const loading = screen.getByRole('progressbar', {
            name: /categories/i,
        });
        expect(loading).toBeInTheDocument();
    });

    it('should hide the loading skeleton after categories are fetched', async () => {
        server.use(http.get('/categories', () => HttpResponse.json([])));
        renderComponent();
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('progressbar', {
                name: /categories/i,
            })
        );
    });

    it('should render a loading skeleton when fetching products', () => {
        server.use(
            http.get('/products', async () => {
                await delay();
                return HttpResponse.json([]);
            })
        );
        renderComponent();
        const skeletonCells = screen.getAllByRole('cell', {
            name: /product/i,
        });
        expect(skeletonCells).toHaveLength(15);
    });

    it('should hide the loading skeleton after products are fetched', async () => {
        server.use(
            http.get('/products', () => HttpResponse.json([])),
            http.get('/categories', () => HttpResponse.json([]))
        );

        renderComponent();
        await waitForElementToBeRemoved(() =>
            screen.queryAllByRole('cell', {
                name: /product/i,
            })
        );
    });

    it('should not render an error if categories cannot be fetched', async () => {
        server.use(http.get('/categories', () => HttpResponse.error()));
        renderComponent();
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('progressbar', {
                name: /categories/i,
            })
        );
        const error = screen.queryByText(/error/i);
        const combobox = screen.queryByRole('combobox', { name: /category/i });
        expect(error).not.toBeInTheDocument();
        expect(combobox).not.toBeInTheDocument();
    });

    it('should render an error if products cannot be fetched', async () => {
        server.use(http.get('/products', () => HttpResponse.error()));
        renderComponent();
        const error = await screen.findByText(/error/i);
        expect(error).toBeInTheDocument();
    });

    it('should render categories', async () => {
        renderComponent();
        const combobox = await screen.findByRole('combobox');
        expect(combobox).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(combobox);

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
        renderComponent();
        await waitForElementToBeRemoved(() =>
            screen.queryAllByRole('cell', { name: /product/i })
        );
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
