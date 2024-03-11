import { render, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import ProductList from '../../src/components/ProductList';
import { db } from '../mocks/db';
import { server } from '../mocks/server';

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

    it('should render the list of products', async () => {
        render(<ProductList />);
        const items = await screen.findAllByRole('listitem');
        expect(items.length).toBeGreaterThan(0);
    });

    it('should render no products available if no product is found', async () => {
        server.use(http.get('/products', () => HttpResponse.json([])));

        render(<ProductList />);
        const message = await screen.findByText(/no products/i);
        expect(message).toBeInTheDocument();
    });
});
