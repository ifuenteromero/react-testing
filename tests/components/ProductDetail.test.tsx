import { render, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import ProductDetail from '../../src/components/ProductDetail';
import { Product } from '../../src/entities';
import { products } from '../mocks/productsData';
import { server } from '../mocks/server';

describe('ProductDetail', () => {
    const productId = 1;
    const renderComponent = (id: number = productId) => {
        render(<ProductDetail productId={id} />);
        return {
            product: products.find((p) => p.id === id) as Product,
        };
    };

    it('should render the product', async () => {
        const { product } = renderComponent();

        const productName = await screen.findByText(new RegExp(product.name));
        const productPrice = await screen.findByText(
            new RegExp(product.price.toString())
        );

        expect(productName).toBeInTheDocument();
        expect(productPrice).toBeInTheDocument();
    });

    it('should render message if product not found', async () => {
        const notFoundId = products.length + 1;
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
