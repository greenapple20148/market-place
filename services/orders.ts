
import { supabase } from './supabase';
import { CartItem, Order } from '../types';

export const ordersService = {
  createOrder: async (userId: string, items: CartItem[], total: number, address: any, paymentIntentId?: string) => {
    // 1. Create the main order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: total,
          status: 'confirmed',
          payment_status: 'paid',
          payment_intent_id: paymentIntentId || `pi_sim_${Math.random().toString(36).substr(2, 9)}`,
          shipping_address: address
        }
      ])
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
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
