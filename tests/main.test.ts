import { it, expect, describe } from 'vitest';
import { faker } from '@faker-js/faker';
import { db } from './mocks/db';

describe('group', () => {
    it('should', () => {
        console.log({
            name: faker.commerce.productName(),
            price: faker.commerce.price({ min: 1, max: 100, dec: 0 }),
        });
        console.log({ products: db.product.getAll() });
    });
});
