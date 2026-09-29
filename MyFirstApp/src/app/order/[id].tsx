import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import { useOrders, OrderStatus } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const { orders, cancelOrder } = useOrders();
  const { addToCart } = useCart();

  const orderId = Array.isArray(id) ? id[0] : id;
  const order = orders.find((item) => item.id === orderId);

  // Order not found
  if (!order) {
    return (
      <View className="flex-1 bg-gray-100">
        <MinimalNavbar showBack={true} title="Order Details" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-black">Order Not Found</Text>
          <Text className="mt-2 text-center text-gray-500">
            This order could not be found.
          </Text>
          <Pressable
            className="mt-6 rounded-xl bg-black px-8 py-4"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const status: OrderStatus = order.status || 'Placed';

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: () => {
            cancelOrder(order.id);
            Alert.alert(
              'Order Cancelled',
              'Your order has been cancelled successfully.'
            );
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addToCart(item, item.quantity);
    });
    Alert.alert(
      'Items Added to Cart 🛒',
      'Items from this order have been added to your cart.',
      [
        {
          text: 'Go to Cart',
          onPress: () => router.push('/(tabs)/cart'),
        },
        { text: 'OK' },
      ]
    );
  };

  const getStatusBadge = () => {
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

  const badge = getStatusBadge();

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <MinimalNavbar
        showBack={true}
        title="Order Details"
        subtitle={order.id}
        showCart={true}
        rightAction={
          <View className={`rounded-full px-2.5 py-1 ${badge.bg}`}>
            <Text className={`text-xs font-bold ${badge.text}`}>
              {badge.label}
            </Text>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        {/* Status Tracker */}
        <View className="rounded-2xl bg-white p-5">
          <Text className="text-sm font-semibold text-gray-500">
            Order Date: {order.date}
          </Text>

          {status === 'Cancelled' ? (
            <View className="mt-4 rounded-xl bg-red-50 p-4">
              <Text className="font-bold text-red-700">🚫 Order Cancelled</Text>
              <Text className="mt-1 text-xs text-red-600">
                This order was cancelled. You can reorder the items anytime.
              </Text>
            </View>
          ) : (
            <View className="mt-5">
              {/* Step 1: Placed */}
              <View className="flex-row">
                <View className="items-center">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-green-600">
                    <Text className="text-xs font-bold text-white">✓</Text>
                  </View>
                  <View
                    className={`h-8 w-0.5 ${
                      status === 'Processing' || status === 'Delivered'
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                </View>
                <View className="ml-4">
                  <Text className="font-bold text-black">Order Placed</Text>
                  <Text className="text-xs text-gray-500">
                    Your order was confirmed
                  </Text>
                </View>
              </View>

              {/* Step 2: Processing */}
              <View className="flex-row">
                <View className="items-center">
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full ${
                      status === 'Processing' || status === 'Delivered'
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        status === 'Processing' || status === 'Delivered'
                          ? 'text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      {status === 'Delivered' ? '✓' : '2'}
                    </Text>
                  </View>
                  <View
                    className={`h-8 w-0.5 ${
                      status === 'Delivered' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </View>
                <View className="ml-4">
                  <Text
                    className={`font-semibold ${
                      status === 'Processing' || status === 'Delivered'
                        ? 'text-black'
                        : 'text-gray-400'
                    }`}
                  >
                    Processing & Packaging
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Preparing for shipment
                  </Text>
                </View>
              </View>

              {/* Step 3: Delivered */}
              <View className="flex-row">
                <View className="items-center">
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full ${
                      status === 'Delivered' ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        status === 'Delivered' ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {status === 'Delivered' ? '✓' : '3'}
                    </Text>
                  </View>
                </View>
                <View className="ml-4">
                  <Text
                    className={`font-semibold ${
                      status === 'Delivered' ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    Out for Delivery
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Will be delivered to your address
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Cancel Button */}
          {status !== 'Cancelled' && status !== 'Delivered' && (
            <Pressable
              className="mt-6 rounded-xl border border-red-300 bg-red-50 py-3"
              onPress={handleCancelOrder}
            >
              <Text className="text-center font-bold text-red-600">
                Cancel Order
              </Text>
            </Pressable>
          )}
        </View>

        {/* Ordered Products */}
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-black">Ordered Items</Text>

          {order.items.map((item, index) => (
            <View
              key={`${item.id}-${index}`}
              className="mt-4 flex-row items-center"
            >
              <Image
                source={{ uri: item.image }}
                className="h-20 w-20 rounded-xl"
                resizeMode="cover"
              />

              <View className="ml-4 flex-1">
                <Text className="text-xs text-gray-500">{item.category}</Text>
                <Text className="mt-0.5 text-base font-bold text-black">
                  {item.name}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  Quantity: {item.quantity}
                </Text>
                <Text className="mt-0.5 font-bold text-black">
                  {item.price}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-black">
            Delivery Address
          </Text>
          <Text className="mt-3 text-base font-bold text-black">
            {order.customer.name}
          </Text>
          <Text className="mt-1 leading-5 text-gray-600">
            {order.customer.address}
          </Text>
          <Text className="mt-0.5 text-gray-600">
            {order.customer.city} - {order.customer.pincode}
          </Text>
          <Text className="mt-1 text-gray-600">
            Phone: {order.customer.phone}
          </Text>
        </View>

        {/* Payment Details */}
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-black">Payment Details</Text>
          <View className="mt-3 flex-row justify-between">
            <Text className="text-gray-500">Method</Text>
            <Text className="font-semibold text-black">
              {order.paymentMethod}
            </Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="font-semibold text-black">
              ₹{order.subtotal.toLocaleString('en-IN')}
            </Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-gray-500">Delivery Fee</Text>
            <Text className="font-semibold text-black">
              {order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}
            </Text>
          </View>
          <View className="my-3 h-px bg-gray-200" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-black">Total Paid</Text>
            <Text className="text-xl font-bold text-black">
              ₹{order.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 flex-row gap-3">
          <Pressable
            className="flex-1 rounded-xl border border-black bg-white py-4"
            onPress={handleReorder}
          >
            <Text className="text-center font-bold text-black">
              🔄 Reorder Items
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-xl bg-black py-4"
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text className="text-center font-bold text-white">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}