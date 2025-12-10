
import { Product, CATEGORIES } from '../types';

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let idCounter = 1;

  Object.entries(CATEGORIES).forEach(([category, subCategories]) => {
    subCategories.forEach((sub) => {
      // Generate 1-2 products per subcategory for demo purposes
      const count = 2;
      for (let i = 0; i < count; i++) {
        const price = Math.floor(Math.random() * 2000) + 500;
        const discount = Math.random() > 0.5 ? Math.floor(price * 0.8) : undefined;
        const stock = Math.floor(Math.random() * 20); // Random stock between 0 and 20
        const mainImage = `https://picsum.photos/seed/${idCounter + 50}/400/600`;
        
        products.push({
          id: idCounter++,
          name: `${sub} - Style ${String.fromCharCode(65 + i)}`,
          category,
          subCategory: sub,
          price: price,
          discountPrice: discount,
          image: mainImage,
          images: [
              mainImage,
              `https://picsum.photos/seed/${idCounter + 100}/400/600`,
              `https://picsum.photos/seed/${idCounter + 200}/400/600`
          ],
          description: `Elegant and comfortable ${sub} designed for the modern woman. Perfect for casual or formal wear depending on styling.`,
          material: category.includes('Cotton') ? '100% Cotton' : 'Premium Blend',
          rating: (Math.random() * 2 + 3), // Rating between 3 and 5
          stock: stock
        });
      }
    });
  });

  return products;
};

export const MOCK_PRODUCTS = generateProducts();

export const getProductById = (id: number): Product | undefined => {
  return MOCK_PRODUCTS.find(p => p.id === id);
};

export const getRelatedProducts = (category: string, currentId: number): Product[] => {
  return MOCK_PRODUCTS.filter(p => p.category === category && p.id !== currentId).slice(0, 4);
};
