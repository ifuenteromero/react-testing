import { render, screen, waitFor } from '@testing-library/react';
import TagList from '../../src/components/TagList';

describe('TagList', () => {
    it('first approach should render tags', async () => {
        render(<TagList />);

        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems.length).toBeGreaterThan(0);
        }); // por default espera 1s y tiene un delay de 500ms si se los subes falla
    });

    it('second approach should render tags', async () => {
        render(<TagList />);

        const listItems = await screen.findAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
    });
});
