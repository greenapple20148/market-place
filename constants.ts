
import { Product, Category } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Handcrafted Ceramic Mug - Ocean Blue',
    description: 'A beautiful hand-thrown ceramic mug inspired by the deep blue of the Pacific ocean. Perfect for your morning coffee or evening tea.',
    price: 32.00,
    seller: 'SeaMistCeramics',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
    category: Category.Home,
    rating: 4.8,
    reviews: 124,
    tags: ['handmade', 'ceramic', 'kitchen']
  },
  {
    id: '2',
    title: 'Minimalist Gold Dainty Necklace',
    description: '14k gold plated necklace with a single tiny freshwater pearl. Elegant simplicity for everyday wear.',
    price: 45.00,
    seller: 'LuminaJewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    category: Category.Jewelry,
    rating: 4.9,
    reviews: 89,
    tags: ['gold', 'minimalist', 'jewelry']
  },
  {
    id: '3',
    title: 'Abstract Botanical Linen Print',
    description: 'Original linocut print featuring stylized monstera and fern leaves. Printed on heavy 100% cotton rag paper.',
    price: 28.00,
    seller: 'WildwoodPrints',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800',
    category: Category.Art,
    rating: 4.7,
    reviews: 56,
    tags: ['art', 'botanical', 'print']
  },
  {
    id: '4',
    title: 'Vintage Leather Travel Satchel',
    description: 'Genuine full-grain leather bag with antique brass hardware. Ages beautifully with time.',
    price: 185.00,
    seller: 'TheLeatherWorkshop',
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800',
    category: Category.Clothing,
    rating: 4.9,
    reviews: 312,
    tags: ['leather', 'vintage', 'bag']
  },
  {
    id: '5',
    title: 'Organic Soy Lavender Candle',
    description: 'Hand-poured candle infused with real dried lavender and premium essential oils. 40-hour burn time.',
    price: 22.00,
    seller: 'BotanicalGlow',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800',
    category: Category.Home,
    rating: 4.6,
    reviews: 215,
    tags: ['candle', 'lavender', 'organic']
  },
  {
    id: '6',
    title: 'Hand-Knitted Chunky Wool Throw',
    description: 'Super soft merino wool throw in cream. Made using arm-knitting techniques for a modern look.',
    price: 120.00,
    seller: 'CosyKnitsStudio',
    image: 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=800',
    category: Category.Home,
    rating: 4.9,
    reviews: 42,
    tags: ['wool', 'knit', 'decor']
  },
  {
    id: '7',
    title: 'Natural Indigo Dye Kit',
    description: 'A complete kit to start your shibori journey. Includes pre-reduced indigo, tools, and a white cotton tote.',
    price: 48.00,
    seller: 'IndigoArts',
    image: 'https://images.unsplash.com/photo-1528460033278-a6ba57020470?auto=format&fit=crop&q=80&w=800',
    category: Category.Craft,
    rating: 4.5,
    reviews: 67,
    tags: ['diy', 'indigo', 'craft']
  }
];
