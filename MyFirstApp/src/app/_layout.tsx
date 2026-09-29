import { Stack } from 'expo-router';
import '../global.css';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { OrdersProvider } from '../context/OrdersContext';
import { WishlistProvider } from '../context/WishlistContext';
import { AddressProvider } from '../context/AddressContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <WishlistProvider>
            <AddressProvider>

              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="order-success" />
                <Stack.Screen name="orders" />
                <Stack.Screen name="addresses" />
                <Stack.Screen name="order/[id]" />
                <Stack.Screen name="edit-profile" />
              </Stack>

            </AddressProvider>
          </WishlistProvider>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}