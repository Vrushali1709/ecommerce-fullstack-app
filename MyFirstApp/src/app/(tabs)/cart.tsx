import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

export default function Cart() {
  const {
    cart,
    isLoaded,
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
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-[#FAFAFB]">
        <MinimalNavbar
          brandText="LUXE STORE"
          showWishlist={true}
          showCart={true}
          showProfile={true}
          showMenu={true}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#111827" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFB]">
      {/* Clean Top Navbar */}
      <MinimalNavbar
        brandText="LUXE STORE"
        showWishlist={true}
        showCart={true}
        showProfile={true}
        showMenu={true}
      />

      {/* Cart Products List */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: cart.length > 0 ? 220 : 40,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        /* Header Below Navbar */
        ListHeaderComponent={
          cart.length > 0 ? (
            <View className="mb-4 flex-row items-center justify-between px-0.5 pt-1">
              <View>
                <Text className="text-2xl font-black tracking-tight text-gray-900">
                  Shopping Bag
                </Text>
                <Text className="mt-0.5 text-xs font-semibold text-gray-500">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your bag
                </Text>
              </View>

              <Pressable
                onPress={handleClearCart}
                className="flex-row items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 shadow-sm active:opacity-70"
              >
                <Ionicons name="trash-outline" size={13} color="#EF4444" />
                <Text className="ml-1 text-xs font-bold text-red-600">
                  Clear All
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        /* Empty Cart State */
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="bag-outline" size={46} color="#9CA3AF" />
            </View>

            <Text className="mt-6 text-center text-2xl font-bold text-black">
              Your Cart is Empty
            </Text>

            <Text className="mt-3 text-center text-base leading-6 text-gray-500">
              Add luxury timepieces, bags, and apparel from our collection.
            </Text>

            <Pressable
              className="mt-7 flex-row items-center rounded-xl bg-black px-7 py-4 shadow-sm active:opacity-80"
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Ionicons name="bag-handle-outline" size={20} color="white" />
              <Text className="ml-2 font-bold text-white">Start Shopping</Text>
            </Pressable>
          </View>
        }
        /* Cart Summary & Coupon Section */
        ListFooterComponent={
          cart.length > 0 ? (
            <View className="mt-2">
              {/* Promo Code Section */}
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
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
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                      className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-black border border-gray-200"
                    />
                    <Pressable
                      className="items-center justify-center rounded-xl bg-black px-5 shadow-sm active:opacity-80"
                      onPress={handleApplyCoupon}
                    >
                      <Text className="font-bold text-white">Apply</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Price Breakdown */}
              <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
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
                      <Text className="text-green-600 font-bold">FREE</Text>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </Text>
                </View>

                <View className="my-3 h-px bg-gray-200" />

                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-black">Total</Text>
                  <Text className="text-xl font-extrabold text-black">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <View className="flex-row">
              <Pressable
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={{ uri: item.image }}
                  className="h-28 w-28 rounded-xl bg-gray-50"
                  resizeMode="cover"
                />
              </Pressable>

              <View className="ml-4 flex-1 justify-between">
                <View>
                  <Text className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                    {item.category}
                  </Text>

                  <Pressable
                    onPress={() => router.push(`/product/${item.id}`)}
                  >
                    <Text className="mt-0.5 text-base font-bold text-black" numberOfLines={2}>
                      {item.name}
                    </Text>
                  </Pressable>

                  <Text className="mt-1 font-extrabold text-black">
                    {item.price}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View className="mt-3 flex-row items-center">
                  <Pressable
                    className="h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 active:bg-gray-200"
                    onPress={() => decreaseQuantity(item.id)}
                  >
                    <Text className="text-lg font-bold text-black">−</Text>
                  </Pressable>

                  <Text className="mx-4 text-base font-bold text-black">
                    {item.quantity}
                  </Text>

                  <Pressable
                    className="h-8 w-8 items-center justify-center rounded-lg bg-black active:opacity-80"
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

      {/* Bottom Floating Checkout Bar (Only when cart has items) */}
      {cart.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 pb-6 pt-4 shadow-lg">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500">Total Amount</Text>
              <Text className="text-2xl font-extrabold text-black">
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
            className="rounded-xl bg-black py-4 shadow-sm active:opacity-90"
            onPress={() => router.push('/checkout')}
          >
            <Text className="text-center text-base font-bold text-white">
              Proceed to Checkout →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}