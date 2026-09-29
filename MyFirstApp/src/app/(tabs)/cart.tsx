import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { router } from 'expo-router';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalPrice,
    promoCode,
    discountAmount,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const { addToWishlist } = useWishlist();
  const [couponInput, setCouponInput] = useState('');

  const deliveryCharge = totalPrice >= 1000 ? 0 : 99;
  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryCharge);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      Alert.alert('Coupon Code', 'Please enter a coupon code.');
      return;
    }
    const res = applyPromoCode(couponInput);
    if (res.success) {
      Alert.alert('Coupon Applied 🎉', res.message);
      setCouponInput('');
    } else {
      Alert.alert('Invalid Coupon', res.message);
    }
  };

  const handleMoveToWishlist = (item: any) => {
    addToWishlist(item);
    removeFromCart(item.id);
    Alert.alert(
      'Saved to Wishlist ❤️',
      `${item.name} has been moved to your wishlist.`
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  // Empty Cart
  if (cart.length === 0) {
    return (
      <View className="flex-1 bg-gray-100">
        <MinimalNavbar title="My Cart" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl">🛒</Text>

          <Text className="mt-4 text-2xl font-bold text-black">
            Your Cart is Empty
          </Text>

          <Text className="mt-2 text-center text-gray-500">
            Add some products from the Home or Explore screen.
          </Text>

          <Pressable
            className="mt-6 rounded-xl bg-black px-8 py-4"
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text className="font-bold text-white">Start Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View className="flex-1 bg-gray-100">
      {/* Top Navbar */}
      <MinimalNavbar
        title="My Cart"
        subtitle={`${totalItemCount} item(s) in bag`}
        rightAction={
          <Pressable
            className="rounded-lg bg-red-50 px-2.5 py-1.5"
            onPress={handleClearCart}
          >
            <Text className="text-xs font-bold text-red-500">Clear</Text>
          </Pressable>
        }
      />

      {/* Cart Products List */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 220,
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="mt-2">
            {/* Promo Code Section */}
            <View className="rounded-2xl bg-white p-5">
              <Text className="text-base font-bold text-black">
                Apply Coupon Code
              </Text>

              {promoCode ? (
                <View className="mt-3 flex-row items-center justify-between rounded-xl bg-green-50 p-4">
                  <View>
                    <Text className="font-bold text-green-800">
                      🏷️ {promoCode} Applied
                    </Text>
                    <Text className="text-xs text-green-600">
                      You saved ₹{discountAmount.toLocaleString('en-IN')}!
                    </Text>
                  </View>
                  <Pressable
                    className="rounded-lg bg-red-100 px-3 py-1.5"
                    onPress={removePromoCode}
                  >
                    <Text className="text-xs font-bold text-red-600">Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="mt-3 flex-row gap-2">
                  <TextInput
                    value={couponInput}
                    onChangeText={setCouponInput}
                    placeholder="Enter SAVE10, SAVE20..."
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-black"
                  />
                  <Pressable
                    className="items-center justify-center rounded-xl bg-black px-5"
                    onPress={handleApplyCoupon}
                  >
                    <Text className="font-bold text-white">Apply</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Price Breakdown */}
            <View className="mt-4 rounded-2xl bg-white p-5">
              <Text className="text-base font-bold text-black">
                Price Breakdown
              </Text>

              <View className="mt-3 flex-row justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="font-semibold text-black">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </Text>
              </View>

              {discountAmount > 0 && (
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-green-600">Coupon Discount</Text>
                  <Text className="font-semibold text-green-600">
                    - ₹{discountAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}

              <View className="mt-2 flex-row justify-between">
                <Text className="text-gray-600">Delivery</Text>
                <Text className="font-semibold text-black">
                  {deliveryCharge === 0 ? (
                    <Text className="text-green-600">FREE</Text>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </Text>
              </View>

              <View className="my-3 h-px bg-gray-200" />

              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-black">Total</Text>
                <Text className="text-xl font-bold text-black">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-2xl bg-white p-4">
            <View className="flex-row">
              <Pressable
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={{ uri: item.image }}
                  className="h-28 w-28 rounded-xl"
                  resizeMode="cover"
                />
              </Pressable>

              <View className="ml-4 flex-1">
                <Text className="text-xs font-semibold uppercase text-gray-500">
                  {item.category}
                </Text>

                <Pressable
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Text className="mt-0.5 text-base font-bold text-black">
                    {item.name}
                  </Text>
                </Pressable>

                <Text className="mt-1 font-bold text-black">
                  {item.price}
                </Text>

                {/* Quantity Controls */}
                <View className="mt-3 flex-row items-center">
                  <Pressable
                    className="h-8 w-8 items-center justify-center rounded-lg bg-gray-200"
                    onPress={() => decreaseQuantity(item.id)}
                  >
                    <Text className="text-lg font-bold text-black">−</Text>
                  </Pressable>

                  <Text className="mx-4 text-base font-bold text-black">
                    {item.quantity}
                  </Text>

                  <Pressable
                    className="h-8 w-8 items-center justify-center rounded-lg bg-black"
                    onPress={() => increaseQuantity(item.id)}
                  >
                    <Text className="text-lg font-bold text-white">+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="mt-4 flex-row justify-between border-t border-gray-100 pt-3">
              <Pressable onPress={() => handleMoveToWishlist(item)}>
                <Text className="text-sm font-semibold text-gray-600">
                  Save to Wishlist
                </Text>
              </Pressable>

              <Pressable onPress={() => removeFromCart(item.id)}>
                <Text className="text-sm font-semibold text-red-500">
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Bottom Floating Checkout Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 pb-6 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-500">Total Amount</Text>
            <Text className="text-2xl font-bold text-black">
              ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </View>
          {deliveryCharge === 0 && (
            <View className="rounded-full bg-green-100 px-3 py-1">
              <Text className="text-xs font-bold text-green-700">
                Free Delivery
              </Text>
            </View>
          )}
        </View>

        <Pressable
          className="rounded-xl bg-black py-4"
          onPress={() => router.push('/checkout')}
        >
          <Text className="text-center text-base font-bold text-white">
            Proceed to Checkout →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}