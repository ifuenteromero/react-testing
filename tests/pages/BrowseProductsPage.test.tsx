import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import { Theme } from '@radix-ui/themes';
import { server } from '../mocks/server';
import { HttpResponse, delay, http } from 'msw';

describe('BrowseProductsPage', () => {
    const renderComponent = () => {
        render(
            <Theme>
                <BrowseProducts />
            </Theme>
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
});
