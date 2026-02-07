
import { supabase, isSupabaseConfigured } from './supabase';
import { CartItem, Order } from '../types';

export const ordersService = {
  createOrder: async (userId: string | null, items: CartItem[], total: number, address: any, paymentIntentId?: string) => {
    if (!isSupabaseConfigured) {
      // Mock order creation for demo mode
      const mockOrderId = `order_${Math.random().toString(36).substr(2, 9)}`;
      const mockOrder = {
        id: mockOrderId,
        user_id: userId || null,
        guest_email: address.guest_email || null,
        total_amount: total,
        status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: paymentIntentId || `pi_demo_${Math.random().toString(36).substr(2, 9)}`,
        shipping_address: address,
        created_at: new Date().toISOString()
      };
      
      // Save to local storage for persistence in demo mode
      const savedOrders = JSON.parse(localStorage.getItem('marketplace_demo_orders') || '[]');
      localStorage.setItem('marketplace_demo_orders', JSON.stringify([mockOrder, ...savedOrders]));
      
      return mockOrder;
    }

    // 1. Create the main order record
    const orderPayload: Partial<Order & { payment_intent_id: string; payment_status: string }> = {
      user_id: userId || undefined, // Supabase treats undefined as null if allowed
      guest_email: address.guest_email || undefined,
      total_amount: total,
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: paymentIntentId || `pi_sim_${Math.random().toString(36).substr(2, 9)}`,
      shipping_address: address
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create individual order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  getUserOrders: async (userId: string) => {
    if (!isSupabaseConfigured) {
      const savedOrders = JSON.parse(localStorage.getItem('marketplace_demo_orders') || '[]');
      return savedOrders.filter((o: any) => o.user_id === userId);
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
