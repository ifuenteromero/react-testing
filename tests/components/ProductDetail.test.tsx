import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';
import ProductDetail from '../../src/components/ProductDetail';
import { server } from '../mocks/server';
import { db } from '../mocks/db';
import AllProviders from '../AllProviders';

describe('ProductDetail', () => {
    let productId: number;
    beforeAll(() => {
        const product = db.product.create();
        productId = product.id;
    });

    afterAll(() => {
        db.product.delete({ where: { id: { equals: productId } } });
    });

    const renderComponent = (id: number = productId) => {
        render(<ProductDetail productId={id} />, { wrapper: AllProviders });
        return {
            product: db.product.findFirst({
                where: { id: { equals: productId } },
            }),
        };
    };

    it('should render the product', async () => {
        const { product } = renderComponent();

        const productName = await screen.findByText(new RegExp(product!.name));
        const productPrice = await screen.findByText(
            new RegExp(product!.price.toString())
        );

        expect(productName).toBeInTheDocument();
        expect(productPrice).toBeInTheDocument();
    });

    it('should render message if product not found', async () => {
        const notFoundId = productId + 1;
        server.use(
            http.get(`/products/${notFoundId}`, () => HttpResponse.json(null))
        );
        renderComponent(notFoundId);

        const message = await screen.findByText(/not found/i);

        expect(message).toBeInTheDocument();
    });

    it('should render an error for invalid productId', async () => {
        renderComponent(0);
        const message = await screen.findByText(/invalid/i);
        expect(message).toBeInTheDocument();
    });

    it('should render an error message if data fetching fails', async () => {
        server.use(
            http.get('/products/' + productId, () => HttpResponse.error())
        );
        renderComponent();

        const errorMessage = await screen.findByText(/error/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should render a loading indicator when fetching data', async () => {
        server.use(
            http.get('/products/' + productId, async () => {
                await delay();
                return HttpResponse.json({});
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
        server.use(
            http.get('/products/' + productId, () => HttpResponse.error())
        );
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    });
});
