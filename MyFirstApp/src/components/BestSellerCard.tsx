import React, { useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../data/products';
import { useWishlist } from '../context/WishlistContext';

interface BestSellerCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export default function BestSellerCard({
  product,
  onPress,
  onAddToCart,
}: BestSellerCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bagButtonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleBagPressIn = () => {
    Animated.spring(bagButtonScale, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  };

  const handleBagPressOut = () => {
    Animated.spring(bagButtonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.imagePressable}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </Pressable>

        {/* Real Discount Badge if applicable */}
        {product.discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {product.discountPercent}% OFF
            </Text>
          </View>
        ) : null}

        {/* Wishlist Button */}
        <Pressable
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product)}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? '#E11D48' : '#111827'}
          />
        </Pressable>
      </View>

      {/* Product Details & Add to Bag Action */}
      <View style={styles.infoContainer}>
        {/* Category & Rating */}
        <View style={styles.categoryRow}>
          <Text style={styles.category} numberOfLines={1}>
            {product.category}
          </Text>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#B89758" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        {/* Product Name */}
        <Pressable onPress={onPress}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
        </Pressable>

        {/* Price & Prominent Circular Add to Bag Button Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>{product.originalPrice}</Text>
            ) : null}
          </View>

          {/* Quick Add to Bag Circular Button */}
          <Animated.View
            style={{
              transform: [{ scale: bagButtonScale }],
            }}
          >
            <Pressable
              onPress={onAddToCart}
              onPressIn={handleBagPressIn}
              onPressOut={handleBagPressOut}
              style={styles.addBagButton}
              accessibilityLabel={`Add ${product.name} to bag`}
            >
              <Ionicons name="bag-handle" size={18} color="#FFFFFF" />
              <View style={styles.plusBadge}>
                <Ionicons name="add" size={10} color="#111827" />
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 228,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#F1F2F4',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 185,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  imagePressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  category: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  name: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 19,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  price: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addBagButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B89758',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
