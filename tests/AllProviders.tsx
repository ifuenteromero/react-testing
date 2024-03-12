import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

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
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
};

export default AllProviders;
