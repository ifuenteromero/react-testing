import { Theme } from '@radix-ui/themes';
import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CartProvider } from '../src/providers/CartProvider';

const AllProviders = ({ children }: PropsWithChildren) => {
    const client = new QueryClient({
        // importante: si no fallan algunos tests porque no renderiza el error al hacer retry
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return (
        <QueryClientProvider client={client}>
            <CartProvider>
                <Theme>{children}</Theme>
            </CartProvider>
        </QueryClientProvider>
    );
};

export default AllProviders;
