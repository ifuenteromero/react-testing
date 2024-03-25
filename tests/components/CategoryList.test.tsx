import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import CategoryList from '../../src/components/CategoryList';
import { Category } from '../../src/entities';
import AllProviders from '../AllProviders';
import { db } from '../mocks/db';
import { simulateDelay, simulateError } from '../utils';

describe('CategoryList', () => {
    const categories: Category[] = [];

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const category = db.category.create();
            categories.push(category);
        });
    });

    afterAll(() => {
        db.category.deleteMany({
            where: { id: { in: categories.map((c) => c.id) } },
        });
    });

    const renderComponent = () => {
        render(<CategoryList />, { wrapper: AllProviders });
    };

    it('should render a list of categories', async () => {
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

        categories.forEach((category) => {
            const item = screen.getByText(category.name);
            expect(item).toBeInTheDocument();
        });
    });

    it('should render a loading indicator when fetching data', () => {
        simulateDelay('/categories');

        renderComponent();
        const loading = screen.getByText(/loading/i);
        expect(loading).toBeInTheDocument();
    });

    it('should remove the loading indicator after data is fetched', async () => {
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    });

    it('should render an error message when there is an error', async () => {
        simulateError('/categories');
        renderComponent();

        const error = await screen.findByText(/error/i);
        expect(error).toBeInTheDocument();
    });

    it('should remove the loading indicator if data fetching fails', async () => {
        simulateError('/categories');
        renderComponent();
        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    });
});
