import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // Full width inside screen container

export interface HeroSlide {
  id: string;
  tag: string;
  titleWhite: string;
  titleGoldLine1: string;
  titleGoldLine2: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  primaryButtonText: string;
  secondaryButtonText: string;
  category: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: 'NEW COLLECTION 2026',
    titleWhite: 'PRECISION.',
    titleGoldLine1: 'CRAFTED FOR',
    titleGoldLine2: 'TIME.',
    subtitle: 'Where timeless Swiss horology meets modern prestige performance.',
    imageSource: require('../../assets/images/luxury_watch_hero.jpg'),
    primaryButtonText: 'SHOP WATCHES',
    secondaryButtonText: 'ALL COLLECTIONS',
    category: 'Watches',
  },
  {
    id: 'slide-2',
    tag: 'ARTISAN ATELIER',
    titleWhite: 'ELEGANCE.',
    titleGoldLine1: 'WOVEN IN',
    titleGoldLine2: 'LEATHER.',
    subtitle: 'Full-grain handcrafted calfskin accessories curated for global journeys.',
    imageSource: require('../../assets/images/luxury_bag_hero.jpg'),
    primaryButtonText: 'EXPLORE BAGS',
    secondaryButtonText: 'ALL COLLECTIONS',
    category: 'Bags',
  },
  {
    id: 'slide-3',
    tag: 'LIMITED EDITION',
    titleWhite: 'BESPOKE.',
    titleGoldLine1: 'DEFINED BY',
    titleGoldLine2: 'LUXURY.',
    subtitle: 'Architectural minimalism and refined textures engineered for distinction.',
    imageSource: require('../../assets/images/luxury_apparel_hero.jpg'),
    primaryButtonText: 'SHOP APPAREL',
    secondaryButtonText: 'ALL COLLECTIONS',
    category: 'Clothing',
  },
];

interface HeroCarouselProps {
  onSelectCategory?: (category: string) => void;
}

export default function HeroCarousel({ onSelectCategory }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % HERO_SLIDES.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * CARD_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < HERO_SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handlePrimaryPress = (slide: HeroSlide) => {
    if (onSelectCategory) {
      onSelectCategory(slide.category);
    } else {
      router.push('/(tabs)/explore');
    }
  };

  const handleSecondaryPress = () => {
    if (onSelectCategory) {
      onSelectCategory('All');
    } else {
      router.push('/(tabs)/explore');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={HERO_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        bounces={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Background Image of the Luxury Product */}
            <Image
              source={item.imageSource}
              style={styles.bgImage}
              resizeMode="cover"
            />

            {/* Gradient Overlays for readability without washing out colors */}
            <View style={styles.darkGradientLeft} />
            <View style={styles.darkGradientBottom} />

            {/* Main Text Content */}
            <View style={styles.mainContent}>
              {/* 1. Accent Line + Tag */}
              <View style={styles.tagRow}>
                <View style={styles.accentLine} />
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>

              {/* 2. Bold Multi-Color Headline */}
              <View style={styles.titleBlock}>
                <Text style={styles.titleWhite}>{item.titleWhite}</Text>
                <Text style={styles.titleGold}>{item.titleGoldLine1}</Text>
                <Text style={styles.titleGold}>{item.titleGoldLine2}</Text>
              </View>

              {/* 3. Subtitle / Description */}
              <Text style={styles.subtitleText}>{item.subtitle}</Text>

              {/* 4. Action Buttons (Side-by-Side Horizontal Row) */}
              <View style={styles.buttonRow}>
                {/* Solid White Pill Button: SHOP WATCHES → */}
                <Pressable
                  onPress={() => handlePrimaryPress(item)}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {item.primaryButtonText}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#000000" />
                </Pressable>

                {/* Glass Border Pill Button: ALL COLLECTIONS */}
                <Pressable
                  onPress={handleSecondaryPress}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {item.secondaryButtonText}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 5. Bottom Divider & Pagination Bar */}
            <View style={styles.footerSection}>
              <View style={styles.dividerLine} />

              <View style={styles.bottomBar}>
                {/* Active Dash + Dots Indicator */}
                <View style={styles.indicatorContainer}>
                  {HERO_SLIDES.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.baseIndicator,
                        activeIndex === idx
                          ? styles.activeDash
                          : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>

                {/* Numeric Counter: 01 / 03 */}
                <Text style={styles.counterText}>
                  {`0${activeIndex + 1}  /  0${HERO_SLIDES.length}`}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: 395,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#090B0E',
    justifyContent: 'space-between',
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkGradientLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '68%',
    backgroundColor: 'rgba(5, 7, 10, 0.70)',
  },
  darkGradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(5, 7, 10, 0.45)',
  },
  mainContent: {
    zIndex: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  accentLine: {
    width: 24,
    height: 1.5,
    backgroundColor: '#C5A880',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C5A880',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleBlock: {
    marginBottom: 4,
  },
  titleWhite: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 31,
  },
  titleGold: {
    fontSize: 27,
    fontWeight: '900',
    color: '#C5A880',
    letterSpacing: -0.4,
    lineHeight: 31,
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    lineHeight: 16.5,
    maxWidth: 230,
    marginTop: 6,
    marginBottom: 14,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 30,
  },
  secondaryButtonText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  footerSection: {
    zIndex: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  baseIndicator: {
    borderRadius: 2,
  },
  activeDash: {
    width: 24,
    height: 3,
    backgroundColor: '#C5A880',
  },
  inactiveDot: {
    width: 5,
    height: 5,
    backgroundColor: '#4B5563',
    borderRadius: 2.5,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C5A880',
    letterSpacing: 1.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
