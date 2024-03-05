import { render, screen } from '@testing-library/react';
import UserList from '../../src/components/UserList';
import { User } from '../../src/entities';

describe('UserList', () => {
    it('should render no users when the users array is empty', () => {
        render(<UserList users={[]} />);
        const text = screen.getByText(/no users/i);
        expect(text).toBeInTheDocument();
    });
    it('should render a list of users', () => {
        const users: User[] = [
            { id: 1, name: 'Irene' },
            { id: 2, name: 'Elvira' },
        ];

        render(<UserList users={users} />);
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2);

        users.forEach((user) => {
            const link = screen.getByRole('link', { name: user.name });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', `/users/${user.id}`);
        });
    });
});
