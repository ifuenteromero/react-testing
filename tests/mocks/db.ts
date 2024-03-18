import { faker } from '@faker-js/faker';
import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data';

export const db = factory({
    category: {
        id: primaryKey(() => faker.number.int()),
        name: () => uniqueCategoryName(),
        product: manyOf('product'),
    },
    product: {
        id: primaryKey(() => faker.number.int()),
        name: () => uniqueProductName(),
        price: () => faker.number.int({ min: 1, max: 100 }),
        categoryId: () => faker.number.int(),
        category: oneOf('category'),
    },
});

export const getProductsByCategory = (categoryId?: number) => {
    if (!categoryId) return db.product.getAll();
    return db.product.findMany({
        where: {
            categoryId: { equals: categoryId },
        },
    });
};

// Helper functions for generating unique names
const uniqueCategoryName = (() => {
    const usedNames = new Set<string>();
    return () => {
        let name;
        do {
            name = faker.commerce.department();
        } while (usedNames.has(name));
        usedNames.add(name);
        return name;
    };
})();

const uniqueProductName = (() => {
    const usedNames = new Set<string>();
    return () => {
        let name;
        do {
            name = faker.commerce.productName();
        } while (usedNames.has(name));
        usedNames.add(name);
        return name;
    };
})();
