
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  seller_id?: string;
  image: string;
  category: string;
  rating: number;
  reviews_count?: number;
  reviews: number; // For compatibility with older code
  tags: string[];
  stock_quantity?: number;
  status?: 'active' | 'draft' | 'archived';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export enum Category {
  Jewelry = "Jewelry & Accessories",
  Home = "Home & Living",
  Wedding = "Wedding & Party",
  Clothing = "Clothing & Shoes",
  Craft = "Craft Supplies & Tools",
  Art = "Art & Collectibles"
}

export interface AIProductSuggestion {
  title: string;
  description: string;
  suggestedPrice: number;
  tags: string[];
}

export interface Order {
  id?: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: any;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}
