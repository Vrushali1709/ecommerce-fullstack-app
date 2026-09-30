import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../data/products';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

export default function Wishlist() {
  const {
    wishlist,
    isLoaded,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  // Move product to cart
  const handleMoveToCart = (item: Product) => {
    addToCart(item);
    removeFromWishlist(item.id);

    Alert.alert(
      'Added to Cart 🛒',
      `${item.name} has been moved to your cart.`
    );
  };

  // Remove product
  const handleRemove = (item: Product) => {
    Alert.alert(
      'Remove from Wishlist',
      `Do you want to remove ${item.name} from your wishlist?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromWishlist(item.id);
          },
        },
      ]
    );
  };

  // Clear all wishlist
  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all wishlist items?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearWishlist();
          },
        },
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

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 35,
          flexGrow: 1,
        }}
        columnWrapperStyle={
          wishlist.length > 0 ? { gap: 12 } : undefined
        }
        /* Header Below Navbar: Title + Count + Clear Button */
        ListHeaderComponent={
          wishlist.length > 0 ? (
            <View className="mb-4 flex-row items-center justify-between px-0.5 pt-1">
              <View>
                <Text className="text-2xl font-black tracking-tight text-gray-900">
                  Wishlist
                </Text>
                <Text className="mt-0.5 text-xs font-semibold text-gray-500">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </Text>
              </View>

              <Pressable
                onPress={handleClearWishlist}
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
        /* Empty State */
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 py-20">
            {/* Icon */}
            <View className="h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <Ionicons
                name="heart-outline"
                size={48}
                color="#EF4444"
              />
            </View>

            {/* Title */}
            <Text className="mt-6 text-center text-2xl font-bold text-black">
              Your Wishlist is Empty
            </Text>

            {/* Message */}
            <Text className="mt-3 text-center text-base leading-6 text-gray-500">
              Save your favorite products here and come back anytime
              to shop your favorites.
            </Text>

            {/* Button */}
            <Pressable
              className="mt-7 flex-row items-center rounded-xl bg-black px-7 py-4 shadow-sm active:opacity-80"
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color="white"
              />

              <Text className="ml-2 font-bold text-white">
                Explore Products
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4 flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Product Image */}
            <View className="relative">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/product/[id]',
                    params: {
                      id: item.id,
                    },
                  })
                }
              >
                <Image
                  source={{ uri: item.image }}
                  className="h-44 w-full bg-gray-50"
                  resizeMode="cover"
                />
              </Pressable>

              {/* Heart Button */}
              <Pressable
                onPress={() => handleRemove(item)}
                className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm active:scale-95"
              >
                <Ionicons
                  name="heart"
                  size={18}
                  color="#EF4444"
                />
              </Pressable>
            </View>

            {/* Product Information with Exact Fixed-Height Alignment */}
            <View className="flex-1 justify-between p-3.5">
              <View>
                {/* Category */}
                <Text
                  numberOfLines={1}
                  className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400"
                >
                  {item.category}
                </Text>

                {/* Product Name (Fixed Height for Perfect Multi-Column Alignment) */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/product/[id]',
                      params: {
                        id: item.id,
                      },
                    })
                  }
                  style={{ height: 38, justifyContent: 'flex-start', marginTop: 3 }}
                >
                  <Text
                    numberOfLines={2}
                    className="text-[13.5px] font-bold leading-[18px] text-gray-900"
                  >
                    {item.name}
                  </Text>
                </Pressable>

                {/* Price + Rating Row */}
                <View className="mt-2.5 flex-row items-center justify-between">
                  <Text className="text-base font-extrabold text-gray-900">
                    {item.price}
                  </Text>

                  <View className="flex-row items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5">
                    <Ionicons
                      name="star"
                      size={11}
                      color="#B89758"
                    />
                    <Text className="text-[11px] font-bold text-amber-800">
                      {item.rating}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Move to Cart Button - Perfectly Aligned at the Bottom */}
              <Pressable
                className="mt-3.5 flex-row items-center justify-center rounded-xl bg-black py-2.5 shadow-sm active:opacity-80"
                onPress={() => handleMoveToCart(item)}
              >
                <Ionicons
                  name="bag-handle-outline"
                  size={15}
                  color="white"
                />
                <Text className="ml-1.5 text-xs font-bold text-white">
                  Move to Cart
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}