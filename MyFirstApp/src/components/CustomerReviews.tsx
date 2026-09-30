import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Review {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  product: string;
  date: string;
  title: string;
  comment: string;
  helpfulCount: number;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Aarav Mehta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    location: 'Mumbai, IN',
    rating: 5,
    product: 'Emerald Chronograph Watch',
    date: 'Yesterday',
    title: 'Flawless craftsmanship & packaging',
    comment:
      'The build quality and weight of the watch exceeded all my expectations. Arrived in pristine luxury packaging within 48 hours. Absolute perfection.',
    helpfulCount: 24,
  },
  {
    id: 'rev-2',
    name: 'Sophia Laurent',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    location: 'Paris, FR',
    rating: 5,
    product: 'Handcrafted Leather Tote',
    date: '3 days ago',
    title: 'Exquisite genuine leather',
    comment:
      'The full-grain leather is buttery smooth and the stitching is world-class. It comfortably fits my 14-inch laptop and daily essentials in style.',
    helpfulCount: 19,
  },
  {
    id: 'rev-3',
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    location: 'Bangalore, IN',
    rating: 5,
    product: 'Nordic Studio Headphones',
    date: '5 days ago',
    title: 'Studio-grade acoustic clarity',
    comment:
      'The active noise cancellation and warm acoustic profile are simply unmatched at this price point. Elegant minimalist Scandinavian design.',
    helpfulCount: 31,
  },
  {
    id: 'rev-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    location: 'Dubai, UAE',
    rating: 5,
    product: '18K Gold Solitaire Ring',
    date: '1 week ago',
    title: 'Breathtaking brilliance',
    comment:
      'Ordered this for our anniversary and it truly looks like fine jewelry from high-end boutiques. Verified certification included in the package.',
    helpfulCount: 42,
  },
];

export default function CustomerReviews() {
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const handleHelpful = (id: string, initialCount: number) => {
    if (likedIds[id]) return;
    const current = likes[id] ?? initialCount;
    setLikes((prev) => ({ ...prev, [id]: current + 1 }));
    setLikedIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <View style={styles.container}>
      {/* Minimal Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <Text style={styles.subtitle}>
          Authentic feedback from verified luxury collectors & buyers
        </Text>
      </View>

      {/* Reviews Horizontal Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        {REVIEWS_DATA.map((rev) => {
          const currentLikes = likes[rev.id] ?? rev.helpfulCount;
          const isLiked = likedIds[rev.id] ?? false;

          return (
            <View key={rev.id} style={styles.card}>
              {/* Stars & Verified Buyer */}
              <View style={styles.cardHeader}>
                <View style={styles.starsRow}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Ionicons
                      key={`star-${rev.id}-${i}`}
                      name="star"
                      size={13}
                      color="#B89758"
                    />
                  ))}
                </View>

                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={11}
                    color="#059669"
                  />
                  <Text style={styles.verifiedText}>Verified Buyer</Text>
                </View>
              </View>

              {/* Review Title & Comment */}
              <Text style={styles.reviewTitle} numberOfLines={1}>
                "{rev.title}"
              </Text>
              <Text style={styles.reviewComment} numberOfLines={4}>
                {rev.comment}
              </Text>

              {/* Product Purchased Tag */}
              <View style={styles.productTag}>
                <Ionicons name="bag-check-outline" size={11} color="#6B7280" />
                <Text style={styles.productTagText} numberOfLines={1}>
                  {rev.product}
                </Text>
              </View>

              {/* Author & Helpful Row */}
              <View style={styles.authorRow}>
                <View style={styles.authorInfo}>
                  <Image source={{ uri: rev.avatar }} style={styles.avatar} />
                  <View style={styles.authorDetails}>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {rev.name}
                    </Text>
                    <Text style={styles.authorLocation}>
                      {rev.location} • {rev.date}
                    </Text>
                  </View>
                </View>

                {/* Helpful Button */}
                <Pressable
                  onPress={() => handleHelpful(rev.id, rev.helpfulCount)}
                  style={[
                    styles.helpfulBtn,
                    isLiked && styles.helpfulBtnActive,
                  ]}
                  hitSlop={6}
                >
                  <Ionicons
                    name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={12}
                    color={isLiked ? '#B89758' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.helpfulText,
                      isLiked && styles.helpfulTextActive,
                    ]}
                  >
                    {currentLikes}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
    marginBottom: 6,
  },
  header: {
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2.5,
  },
  scrollContent: {
    paddingRight: 16,
    paddingVertical: 6,
  },
  card: {
    width: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F1F2F4',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#065F46',
  },
  reviewTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 19,
  },
  reviewComment: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4B5563',
    marginBottom: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 14,
  },
  productTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  authorLocation: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  helpfulBtnActive: {
    backgroundColor: '#FEF3C7',
  },
  helpfulText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  helpfulTextActive: {
    color: '#92400E',
  },
});
