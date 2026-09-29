import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ordersApi, ApiOrder } from '../services/api';
import { useAuth } from './AuthContext';

export type OrderItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  quantity: number;
};

export type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI'
  | 'Card';

export type OrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  order_number?: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
  status?: OrderStatus;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Order) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
};

const OrdersContext = createContext<
  OrdersContextType | undefined
>(undefined);

const ORDERS_STORAGE_KEY = '@myfirstapp_orders';

export function OrdersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load orders from local storage first
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const savedOrders = await AsyncStorage.getItem(
          ORDERS_STORAGE_KEY
        );

        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          const withStatus = parsed.map((o: Order) => ({
            ...o,
            status: o.status || 'Placed',
          }));
          setOrders(withStatus);
        }
      } catch (error) {
        console.log('Failed to load orders:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadOrders();
  }, []);

  // Sync with Backend API when token is present
  useEffect(() => {
    if (token) {
      refreshOrders();
    }
  }, [token]);

  const refreshOrders = async () => {
    if (!token) return;
    try {
      const serverOrders = await ordersApi.getAll();
      if (serverOrders && Array.isArray(serverOrders)) {
        const mappedOrders: Order[] = serverOrders.map((so: ApiOrder) => ({
          id: so.id,
          order_number: so.order_number,
          date: so.date,
          status: (so.status as OrderStatus) || 'Placed',
          subtotal: so.subtotal,
          delivery: so.delivery,
          total: so.total,
          paymentMethod: so.paymentMethod as PaymentMethod,
          customer: so.customer,
          items: so.items.map((it) => ({
            id: it.id || it.product_id || '',
            name: it.name,
            price: it.price,
            category: it.category || '',
            image: it.image,
            quantity: it.quantity,
          })),
        }));

        setOrders(mappedOrders);
        await AsyncStorage.setItem(
          ORDERS_STORAGE_KEY,
          JSON.stringify(mappedOrders)
        );
      }
    } catch (err) {
      console.log('Backend orders sync note:', err);
    }
  };

  // Save orders to local storage
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveOrders = async () => {
      try {
        await AsyncStorage.setItem(
          ORDERS_STORAGE_KEY,
          JSON.stringify(orders)
        );
      } catch (error) {
        console.log('Failed to save orders:', error);
      }
    };

    saveOrders();
  }, [orders, isLoaded]);

  const addOrder = async (order: Order): Promise<Order> => {
    let finalOrder: Order = {
      ...order,
      status: order.status || 'Placed',
    };

    // Try creating via Backend API
    try {
      const createdApiOrder = await ordersApi.create({
        items: order.items.map((i) => ({
          product_id: i.id,
          name: i.name,
          price: i.price,
          category: i.category,
          image: i.image,
          quantity: i.quantity,
        })),
        subtotal: order.subtotal,
        delivery: order.delivery,
        total: order.total,
        paymentMethod: order.paymentMethod,
        customer: order.customer,
      });

      if (createdApiOrder?.id) {
        finalOrder = {
          id: createdApiOrder.id,
          order_number: createdApiOrder.order_number,
          date: createdApiOrder.date,
          status: (createdApiOrder.status as OrderStatus) || 'Placed',
          subtotal: createdApiOrder.subtotal,
          delivery: createdApiOrder.delivery,
          total: createdApiOrder.total,
          paymentMethod: createdApiOrder.paymentMethod as PaymentMethod,
          customer: createdApiOrder.customer,
          items: createdApiOrder.items.map((it) => ({
            id: it.id || it.product_id || '',
            name: it.name,
            price: it.price,
            category: it.category || '',
            image: it.image,
            quantity: it.quantity,
          })),
        };
      }
    } catch (apiError) {
      console.log('Backend create order note (offline/fallback):', apiError);
    }

    setOrders((currentOrders) => [finalOrder, ...currentOrders]);
    return finalOrder;
  };

  const cancelOrder = async (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Cancelled' as OrderStatus }
          : order
      )
    );

    try {
      await ordersApi.updateStatus(orderId, 'Cancelled');
    } catch (err) {
      console.log('Backend cancelOrder error:', err);
    }
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        cancelOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error(
      'useOrders must be used inside OrdersProvider'
    );
  }

  return context;
}