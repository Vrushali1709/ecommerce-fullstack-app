import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export interface MinimalNavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showCart?: boolean;
  showWishlist?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
  rightAction?: React.ReactNode;
  brandText?: string;
  transparent?: boolean;
}

export default function MinimalNavbar({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  showCart = false,
  showWishlist = false,
  showSearch = false,
  onSearchPress,
  rightAction,
  brandText,
  transparent = false,
}: MinimalNavbarProps) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const paddingTop = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop },
        transparent ? styles.headerTransparent : styles.headerSolid,
      ]}
    >
      <View style={styles.contentRow}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </Pressable>
          ) : brandText ? (
            <Text style={styles.brandText}>{brandText}</Text>
          ) : null}
        </View>

        {/* Center Section: Title & Subtitle */}
        <View style={styles.centerSection}>
          {title ? (
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right Section: Actions & Badges */}
        <View style={styles.rightSection}>
          {showSearch && (
            <Pressable
              onPress={
                onSearchPress ||
                (() => router.push('/(tabs)/explore'))
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="search-outline" size={22} color="#111827" />
            </Pressable>
          )}

          {showWishlist && (
            <Pressable
              onPress={() => router.push('/(tabs)/wishlist')}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="heart-outline" size={22} color="#111827" />
              {wishlist.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {wishlist.length > 99 ? '99+' : wishlist.length}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {showCart && (
            <Pressable
              onPress={() => router.push('/(tabs)/cart')}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="bag-handle-outline" size={22} color="#111827" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSolid: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#111827',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
