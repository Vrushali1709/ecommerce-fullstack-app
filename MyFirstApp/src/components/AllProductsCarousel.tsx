import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../data/products';
import { useWishlist } from '../context/WishlistContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 280);
const CARD_MARGIN = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

interface AllProductsCarouselProps {
  products: Product[];
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function AllProductsCarousel({
  products,
  onPress,
}: AllProductsCarouselProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Product>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < products.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < products.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * SNAP_INTERVAL,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Snapping Carousel FlatList */}
      <FlatList
        ref={flatListRef}
        data={products}
        keyExtractor={(item) => `carousel-prod-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const saved = isInWishlist(item.id);
          const isCurrent = index === activeIndex;

          return (
            <Pressable
              onPress={() => onPress(item)}
              style={[
                styles.card,
                isCurrent && styles.cardActive,
              ]}
            >
              {/* Product Image & Badges */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Real Discount Badge if applicable */}
                {item.discountPercent ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {item.discountPercent}% OFF
                    </Text>
                  </View>
                ) : null}

                {/* Wishlist Toggle Button */}
                <Pressable
                  style={styles.wishlistButton}
                  onPress={() => toggleWishlist(item)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={saved ? 'heart' : 'heart-outline'}
                    size={18}
                    color={saved ? '#E11D48' : '#111827'}
                  />
                </Pressable>
              </View>

              {/* Product Details */}
              <View style={styles.infoContainer}>
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {item.category}
                  </Text>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color="#B89758" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                <Text style={styles.nameText} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  {item.originalPrice ? (
                    <Text style={styles.originalPriceText}>
                      {item.originalPrice}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Carousel Pagination Dots */}
      <View style={styles.paginationContainer}>
        {products.map((_, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <Pressable
              key={`dot-${idx}`}
              onPress={() => scrollToIndex(idx)}
              style={[
                styles.dot,
                isSelected ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  listContent: {
    paddingRight: 16,
    paddingVertical: 6,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginRight: CARD_MARGIN,
    borderWidth: 1.5,
    borderColor: '#F1F2F4',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardActive: {
    borderColor: '#E2DFD8',
    shadowOpacity: 0.12,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#F8F9FA',
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
    letterSpacing: 0.4,
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
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6.5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  priceText: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#111827',
  },
  originalPriceText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
    marginBottom: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#B89758',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});
