
export interface ModerationLog {
  timestamp: string;
  type: 'ai_scan' | 'manual_review' | 'user_report';
  status: string;
  reason: string;
  confidence?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  seller_name: string;
  seller_id: string;
  images: string[];
  category: string;
  rating: number;
  reviews_count?: number;
  reviews: number;
  tags: string[];
  stock_quantity?: number;
  status?: 'active' | 'draft' | 'archived';
  declared_handmade?: boolean;
  moderation_status?: 'approved' | 'pending_review' | 'flagged' | 'rejected';
  moderation_reason?: string;
  moderation_logs?: ModerationLog[]; // Added for compliance auditing
  is_flagged?: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboarding_completed?: boolean;
  verification_status?: 'unverified' | 'pending' | 'verified';
  shop_name?: string;
  bank_last_four?: string;
  seller_declaration_signed?: boolean;
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
  user_id?: string;
  guest_email?: string;
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
