import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';
import ProductList from '../../src/components/ProductList';
import { db } from '../mocks/db';
import { server } from '../mocks/server';
import { QueryClient, QueryClientProvider } from 'react-query';

describe('ProductList', () => {
    const productIds: number[] = [];

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const product = db.product.create();
            productIds.push(product.id);
        });
    });

    afterAll(() => {
        db.product.delete({ where: { id: { in: productIds } } });
    });

    const renderComponent = () => {
        const client = new QueryClient({
            // importante: si no fallan algunos tests porque no renderiza el error al hacer retry
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        render(
            <QueryClientProvider client={client}>
                <ProductList />
            </QueryClientProvider>
        );
    };

    it('should render the list of products', async () => {
        renderComponent();
        const items = await screen.findAllByRole('listitem');
        expect(items.length).toBeGreaterThan(0);
    });

    it('should render no products available if no product is found', async () => {
        server.use(http.get('/products', () => HttpResponse.json([])));

        renderComponent();
        const message = await screen.findByText(/no products/i);
        expect(message).toBeInTheDocument();
    });

    it('should render an error message when there is an error', async () => {
        server.use(http.get('/products', () => HttpResponse.error()));
        renderComponent();
        const errorMessage = await screen.findByText(/error/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should render a loading indicator when fetching data', async () => {
        server.use(
            http.get('/products', async () => {
                await delay();
                return HttpResponse.json([]);
            })
        );
        renderComponent();
        const loading = await screen.findByText(/loading/i);
        expect(loading).toBeInTheDocument();
    });

    it('should remove the loading indicator after data is fetched', async () => {
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    });

    it('should remove the loading indicator if data fetching fails', async () => {
        server.use(http.get('/products', () => HttpResponse.error()));
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    });
});
