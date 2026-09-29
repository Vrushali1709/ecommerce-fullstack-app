import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
} from 'react-native';

import { Product } from '../data/products';
import { useWishlist } from '../context/WishlistContext';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
};

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  // Card animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      className="mb-5 overflow-hidden rounded-2xl bg-white"
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim,
          },
        ],
      }}
    >
      {/* Product Image + Details */}
      <View className="relative">
        <Pressable onPress={onPress}>
          <Image
            source={{ uri: product.image }}
            className="h-56 w-full"
            resizeMode="cover"
          />
        </Pressable>

        {/* Discount Badge */}
        {product.discountPercent ? (
          <View className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 shadow-sm">
            <Text className="text-xs font-bold text-white">
              {product.discountPercent}% OFF
            </Text>
          </View>
        ) : null}

        {/* Wishlist Quick Toggle Button */}
        <Pressable
          className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm"
          onPress={() => toggleWishlist(product)}
        >
          <Text className="text-xl">
            {saved ? '❤️' : '♡'}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={onPress} className="p-5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {product.category}
        </Text>

        <Text className="mt-1 text-lg font-bold text-black" numberOfLines={1}>
          {product.name}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-xl font-bold text-black">
              {product.price}
            </Text>
            {product.originalPrice ? (
              <Text className="text-xs text-gray-400 line-through">
                {product.originalPrice}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center rounded-lg bg-amber-50 px-2 py-1">
            <Text className="text-xs font-bold text-amber-700">
              ⭐ {product.rating}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Add To Cart */}
      <View className="px-5 pb-5">
        <Animated.View
          style={{
            transform: [
              {
                scale: buttonScale,
              },
            ],
          }}
        >
          <Pressable
            className="rounded-xl bg-black py-3"
            onPress={onAddToCart}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text className="text-center font-bold text-white">
              Add to Cart
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}