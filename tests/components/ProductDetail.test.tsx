import { render, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import ProductDetail from '../../src/components/ProductDetail';
import { Product } from '../../src/entities';
import { server } from '../mocks/server';
import { db } from '../mocks/db';

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
        render(<ProductDetail productId={id} />);
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
});
