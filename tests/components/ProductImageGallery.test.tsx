import { render, screen } from '@testing-library/react';
import ProductImageGallery from '../../src/components/ProductImageGallery';

describe('ProductImageGallery', () => {
    it('should render nothing if given an empty array', () => {
        const { container } = render(<ProductImageGallery imageUrls={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render a list of images', () => {
        const imageUrls = ['url1', 'url2'];

        render(<ProductImageGallery imageUrls={imageUrls} />);
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);

        imageUrls.forEach((url, index) => {
            const image = images[index];
            expect(image).toHaveAttribute('src', url);
        });
    });
});
