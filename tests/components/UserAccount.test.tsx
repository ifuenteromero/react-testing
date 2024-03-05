import { render, screen } from '@testing-library/react';
import UserAccount from '../../src/components/UserAccount';
import { User } from '../../src/entities';

const regularUser: User = {
    id: 1,
    name: 'Irene',
};

const adminUser: User = {
    id: 2,
    name: 'Irene',
    isAdmin: true,
};

describe('UserAccount', () => {
    it('should render user name', () => {
        render(<UserAccount user={regularUser} />);
        const userName = screen.getByText(regularUser.name);
        expect(userName).toBeInTheDocument();
    });
    it('should not render edit button if user is not admin', () => {
        render(<UserAccount user={regularUser} />);
        const editButton = screen.queryByRole('button');
        expect(editButton).not.toBeInTheDocument();
    });
    it('should render edit button if user is admin', () => {
        render(<UserAccount user={adminUser} />);
        const editButton = screen.getByRole('button');
        expect(editButton).toBeInTheDocument();
        expect(editButton).toHaveTextContent(/edit/i);
    });
});
