import { Table } from '@radix-ui/themes';
import axios from 'axios';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useQuery } from 'react-query';
import CategorySelect from '../components/CategorySelect';
import QuantitySelector from '../components/QuantitySelector';
import { Product } from '../entities';

function BrowseProducts() {
    const productsQuery = useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: () =>
            axios.get<Product[]>('/products').then((res) => res.data),
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState<
        number | undefined
    >();

    const {
        error: errorProducts,
        data: products,
        isLoading: isProductsLoading,
    } = productsQuery;

    if (errorProducts) return <div>Error: {errorProducts.message}</div>;

    const renderProducts = () => {
        const skeletons = [1, 2, 3, 4, 5];

        if (errorProducts) return <div>Error: {errorProducts}</div>;

        const visibleProducts = selectedCategoryId
            ? products!.filter((p) => p.categoryId === selectedCategoryId)
            : products;

        return (
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {isProductsLoading &&
                        skeletons.map((skeleton) => (
                            <Table.Row key={skeleton}>
                                <Table.Cell aria-label='loading product'>
                                    <Skeleton />
                                </Table.Cell>
                                <Table.Cell aria-label='loading product'>
                                    <Skeleton />
                                </Table.Cell>
                                <Table.Cell aria-label='loading product'>
                                    <Skeleton />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    {!isProductsLoading &&
                        visibleProducts!.map((product) => (
                            <Table.Row key={product.id}>
                                <Table.Cell>{product.name}</Table.Cell>
                                <Table.Cell>${product.price}</Table.Cell>
                                <Table.Cell>
                                    <QuantitySelector product={product} />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                </Table.Body>
            </Table.Root>
        );
    };

    return (
        <div>
            <h1>Products</h1>
            <div className='max-w-xs'>
                <CategorySelect onChange={setSelectedCategoryId} />
            </div>
            {renderProducts()}
        </div>
    );
}

export default BrowseProducts;
