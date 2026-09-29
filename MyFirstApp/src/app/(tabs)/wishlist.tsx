import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
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

  // Empty Wishlist
  if (wishlist.length === 0) {
    return (
      <View className="flex-1 bg-[#FAFAFB]">
        <MinimalNavbar title="Wishlist" showCart={true} />
        <View className="flex-1 items-center justify-center px-7">
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
            className="mt-7 flex-row items-center rounded-xl bg-black px-7 py-4"
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFB]">
      {/* Top Navbar */}
      <MinimalNavbar
        title="Wishlist"
        subtitle={`${wishlist.length} item(s) saved`}
        showCart={true}
        rightAction={
          <Pressable
            onPress={handleClearWishlist}
            className="rounded-lg bg-red-50 px-2.5 py-1.5"
          >
            <Text className="text-xs font-bold text-red-500">Clear</Text>
          </Pressable>
        }
      />

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 35,
        }}
        columnWrapperStyle={{
          gap: 12,
        }}
        renderItem={({ item }) => (
          <View className="mb-4 flex-1 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
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
                  className="h-44 w-full"
                  resizeMode="cover"
                />
              </Pressable>

              {/* Heart Button */}
              <Pressable
                onPress={() => handleRemove(item)}
                className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
              >
                <Ionicons
                  name="heart"
                  size={18}
                  color="#EF4444"
                />
              </Pressable>
            </View>

            {/* Product Information */}
            <View className="p-3.5">
              <Text
                numberOfLines={1}
                className="text-xs font-semibold uppercase text-gray-400"
              >
                {item.category}
              </Text>

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
                <Text
                  numberOfLines={2}
                  className="mt-1 text-sm font-bold leading-5 text-black"
                >
                  {item.name}
                </Text>
              </Pressable>

              {/* Price + Rating */}
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-base font-bold text-black">
                  {item.price}
                </Text>

                <View className="flex-row items-center">
                  <Ionicons
                    name="star"
                    size={13}
                    color="#F59E0B"
                  />
                  <Text className="ml-0.5 text-xs font-bold text-gray-600">
                    {item.rating}
                  </Text>
                </View>
              </View>

              {/* Move to Cart */}
              <Pressable
                className="mt-3 flex-row items-center justify-center rounded-xl bg-black py-2.5"
                onPress={() => handleMoveToCart(item)}
              >
                <Ionicons
                  name="bag-handle-outline"
                  size={15}
                  color="white"
                />
                <Text className="ml-1 text-xs font-bold text-white">
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