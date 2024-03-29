import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuantitySelector from '../../src/components/QuantitySelector';
import { Product } from '../../src/entities';
import { CartProvider } from '../../src/providers/CartProvider';

describe('QuantitySelector', () => {
    const renderComponent = () => {
        const product: Product = {
            id: 1,
            name: 'Milk',
            price: 5,
            categoryId: 1,
        };

        render(
            <CartProvider>
                <QuantitySelector product={product} />
            </CartProvider>
        );

        const user = userEvent.setup();

        const getAddToCartButton = () =>
            screen.getByRole('button', {
                name: /add to cart/i,
            });

        const getQuantityControls = () => ({
            quantity: screen.getByRole('status'),
            decrementButton: screen.getByRole('button', {
                name: '-',
            }),
            incrementButton: screen.getByRole('button', {
                name: '+',
            }),
        });

        const addToCart = async () => {
            const addToCartButton = getAddToCartButton();
            await user.click(addToCartButton);
            return addToCartButton;
        };

        const incrementQuantity = async () => {
            const { incrementButton } = getQuantityControls();
            await user.click(incrementButton);
        };

        const decrementQuantity = async () => {
            const { decrementButton } = getQuantityControls();
            await user.click(decrementButton);
        };

        return {
            getAddToCartButton,
            getQuantityControls,
            addToCart,
            incrementQuantity,
            decrementQuantity,
        };
    };

    it('should render the Add to Cart button', () => {
        const { getAddToCartButton } = renderComponent();

        expect(getAddToCartButton()).toBeInTheDocument();
    });

    it('should add the product to the cart', async () => {
        const { getQuantityControls, addToCart } = renderComponent();

        const addToCartButton = await addToCart();

        const { quantity, incrementButton, decrementButton } =
            getQuantityControls();
        expect(quantity).toHaveTextContent('1');
        expect(decrementButton).toBeInTheDocument();
        expect(incrementButton).toBeInTheDocument();
        expect(addToCartButton).not.toBeInTheDocument();
    });

    it('should increment the quantity', async () => {
        const { getQuantityControls, addToCart, incrementQuantity } =
            renderComponent();
        await addToCart();

        await incrementQuantity();

        const { quantity } = getQuantityControls();
        expect(quantity).toHaveTextContent('2');
    });

    it('should decrement the quantity', async () => {
        const {
            getQuantityControls,
            addToCart,
            incrementQuantity,
            decrementQuantity,
        } = renderComponent();

        await addToCart();

        await incrementQuantity();
        await decrementQuantity();

        const { quantity } = getQuantityControls();
        expect(quantity).toHaveTextContent('1');
    });

    it('should remove the product from the cart', async () => {
        const {
            getAddToCartButton,
            getQuantityControls,
            addToCart,
            decrementQuantity,
        } = renderComponent();
        await addToCart();

        const { incrementButton, decrementButton, quantity } =
            getQuantityControls();
        await decrementQuantity();

        expect(quantity).not.toBeInTheDocument();
        expect(decrementButton).not.toBeInTheDocument();
        expect(incrementButton).not.toBeInTheDocument();
        expect(getAddToCartButton()).toBeInTheDocument();
    });
});
