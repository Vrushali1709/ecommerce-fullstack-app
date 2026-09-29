import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
} from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { useOrders, OrderStatus } from '../context/OrdersContext';
import { useCart } from '../context/CartContext';
import MinimalNavbar from '../components/navigation/MinimalNavbar';

export default function Orders() {
  const { orders } = useOrders();
  const { addToCart } = useCart();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterTabs = ['All', 'Placed', 'Processing', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'All') return true;
    return (order.status || 'Placed') === selectedFilter;
  });

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart(item, item.quantity);
    });
    Alert.alert(
      'Items Added to Cart 🛒',
      'All items from this order have been added to your cart.',
      [
        {
          text: 'View Cart',
          onPress: () => router.push('/(tabs)/cart'),
        },
        { text: 'OK' },
      ]
    );
  };

  const getStatusBadge = (status: OrderStatus = 'Placed') => {
    switch (status) {
      case 'Delivered':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' };
      case 'Processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' };
      case 'Cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
      case 'Placed':
      default:
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed' };
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <MinimalNavbar
        showBack={true}
        title="My Orders"
        subtitle={`${orders.length} total order(s)`}
        showCart={true}
      />

      {/* Filter Pills */}
      <View className="bg-white px-4 pb-3 border-b border-gray-100">
        <FlatList
          data={filterTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          className="mt-4"
          renderItem={({ item }) => {
            const active = selectedFilter === item;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item)}
                className={`mr-2 rounded-full px-4 py-2 ${
                  active ? 'bg-black' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Empty Orders */}
      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl">📦</Text>
          <Text className="mt-4 text-2xl font-bold text-black">
            No Orders Yet
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Your placed orders will appear here.
          </Text>

          <Pressable
            className="mt-6 rounded-xl bg-black px-8 py-4"
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text className="font-bold text-white">Start Shopping</Text>
          </Pressable>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl">🔍</Text>
          <Text className="mt-3 text-xl font-bold text-black">
            No {selectedFilter} Orders
          </Text>
          <Pressable
            className="mt-4 rounded-xl bg-black px-6 py-3"
            onPress={() => setSelectedFilter('All')}
          >
            <Text className="font-bold text-white">Show All Orders</Text>
          </Pressable>
        </View>
      ) : (
        /* Orders List */
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <Pressable
                className="mb-5 rounded-2xl bg-white p-5"
                onPress={() => router.push(`/order/${item.id}`)}
              >
                {/* Order Header */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs text-gray-500">Order ID</Text>
                    <Text className="mt-0.5 font-bold text-black">
                      {item.id}
                    </Text>
                  </View>

                  <View className={`rounded-full px-3 py-1 ${badge.bg}`}>
                    <Text className={`text-xs font-bold ${badge.text}`}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Date */}
                <Text className="mt-2 text-xs text-gray-500">
                  Placed on {item.date}
                </Text>

                {/* Products Preview */}
                {item.items.map((product, idx) => (
                  <View
                    key={`${product.id}-${idx}`}
                    className="mt-3 flex-row items-center"
                  >
                    <Image
                      source={{ uri: product.image }}
                      className="h-14 w-14 rounded-xl"
                      resizeMode="cover"
                    />

                    <View className="ml-3 flex-1">
                      <Text
                        numberOfLines={1}
                        className="font-bold text-black text-sm"
                      >
                        {product.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-500">
                        Qty: {product.quantity}
                      </Text>
                    </View>

                    <Text className="font-bold text-black text-sm">
                      ₹
                      {(
                        Number(product.price.replace(/[₹,]/g, '')) *
                        product.quantity
                      ).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}

                <View className="my-4 h-px bg-gray-100" />

                {/* Total & Action */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-gray-500">Total Amount</Text>
                    <Text className="text-lg font-bold text-black">
                      ₹{item.total.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <Pressable
                      className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
                      onPress={() => handleReorder(item)}
                    >
                      <Text className="text-xs font-bold text-black">
                        🔄 Reorder
                      </Text>
                    </Pressable>

                    <Pressable
                      className="rounded-xl bg-black px-4 py-2"
                      onPress={() => router.push(`/order/${item.id}`)}
                    >
                      <Text className="text-xs font-bold text-white">
                        Details →
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}