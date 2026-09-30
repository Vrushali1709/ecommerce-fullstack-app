import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { categories as defaultCategories } from '../../data/products';

export interface MinimalNavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showWishlist?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  showMenu?: boolean;
  rightAction?: React.ReactNode;
  brandText?: string;
  transparent?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  All: '✨',
  Watches: '⌚',
  Bags: '👜',
  Clothing: '👗',
  Footwear: '👟',
  Jewelry: '💍',
  Accessories: '🕶️',
  Electronics: '🎧',
  Beauty: '🧴',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MinimalNavbar({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  showWishlist = true,
  showCart = true,
  showProfile = true,
  showMenu = true,
  rightAction,
  brandText = 'LUXE STORE',
  transparent = false,
}: MinimalNavbarProps) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleNavigate = (path: string) => {
    setMenuVisible(false);
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const paddingTop = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);

  const isCart = pathname === '/(tabs)/cart' || pathname === '/cart';
  const isWishlist = pathname === '/(tabs)/wishlist' || pathname === '/wishlist';
  const isProfile = pathname === '/(tabs)/profile' || pathname === '/profile';

  return (
    <>
      <View
        style={[
          styles.headerContainer,
          { paddingTop },
          transparent ? styles.headerTransparent : styles.headerSolid,
        ]}
      >
        <View style={styles.topRow}>
          {/* Left Section: Brand or Back */}
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
            ) : (
              <Pressable
                onPress={() => router.push('/(tabs)/home')}
                style={styles.brandContainer}
              >
                <Text style={styles.brandText}>{brandText}</Text>
                <View style={styles.brandDot} />
              </Pressable>
            )}

            {title && !showBack && (
              <View style={styles.titleWrapper}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitleText} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Center Section if back button is shown */}
          {showBack && title ? (
            <View style={styles.centerSection}>
              <Text style={styles.titleText} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitleText} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Right Section: Badges & 3-Line Hamburger Menu */}
          <View style={styles.rightSection}>
            {showWishlist && (
              <Pressable
                onPress={() => router.push('/(tabs)/wishlist')}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.iconButton,
                  isWishlist && styles.activeIconButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityLabel="Wishlist"
              >
                <Ionicons
                  name={isWishlist ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isWishlist ? '#E11D48' : '#111827'}
                />
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
                hitSlop={6}
                style={({ pressed }) => [
                  styles.iconButton,
                  isCart && styles.activeIconButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityLabel="Cart"
              >
                <Ionicons
                  name={isCart ? 'bag-handle' : 'bag-handle-outline'}
                  size={20}
                  color={isCart ? '#B89758' : '#111827'}
                />
                {cartCount > 0 && (
                  <View style={[styles.badge, styles.cartBadge]}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}

            {showProfile && (
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.iconButton,
                  isProfile && styles.activeIconButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityLabel="Profile"
              >
                <Ionicons
                  name={isProfile ? 'person' : 'person-outline'}
                  size={20}
                  color={isProfile ? '#B89758' : '#111827'}
                />
              </Pressable>
            )}

            {/* 3-LINE MENU (HAMBURGER) BUTTON */}
            {showMenu && (
              <Pressable
                onPress={() => setMenuVisible(true)}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.hamburgerButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityLabel="Open Navigation Menu"
              >
                <View style={styles.hamburgerIcon}>
                  <View style={styles.hamburgerBar} />
                  <View style={styles.hamburgerBar} />
                  <View style={styles.hamburgerBar} />
                </View>
              </Pressable>
            )}

            {rightAction}
          </View>
        </View>
      </View>

      {/* =====================================================
          SIDE DRAWER / MENU MODAL WITH ALL COLLECTIONS
      ===================================================== */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop press to close */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenuVisible(false)}
          />

          {/* Slide Drawer Content */}
          <View
            style={[
              styles.drawerContent,
              { paddingTop: Math.max(insets.top + 10, 44), paddingBottom: Math.max(insets.bottom + 10, 20) },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerBrandText}>LUXE STORE</Text>
                <Text style={styles.drawerBrandSub}>Luxury Everyday Collection</Text>
              </View>

              <Pressable
                onPress={() => setMenuVisible(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            {/* User Greeting Card if logged in */}
            <Pressable
              onPress={() => handleNavigate('/(tabs)/profile')}
              style={styles.userCard}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Hello, Guest'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'Tap to view profile'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.drawerScroll}
            >
              {/* 1. QUICK MAIN NAVIGATION */}
              <Text style={styles.sectionHeading}>MAIN NAVIGATION</Text>
              <View style={styles.menuList}>
                <Pressable
                  onPress={() => handleNavigate('/(tabs)/home')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="home-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>Home Page</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/(tabs)/explore')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="compass-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>Explore All Products</Text>
                  </View>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>NEW</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/orders')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="receipt-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>My Orders</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/addresses')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="location-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>Saved Addresses</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/(tabs)/wishlist')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="heart-outline" size={19} color="#E11D48" />
                    <Text style={styles.menuItemText}>Saved Wishlist</Text>
                  </View>
                  {wishlist.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{wishlist.length}</Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/(tabs)/cart')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="bag-handle-outline" size={19} color="#B89758" />
                    <Text style={styles.menuItemText}>Shopping Cart</Text>
                  </View>
                  {cartCount > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: '#B89758' }]}>
                      <Text style={styles.countBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* 2. ALL COLLECTIONS / CATEGORIES */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>SHOP BY COLLECTION</Text>
                <Pressable onPress={() => handleNavigate('/(tabs)/explore')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </View>

              <View style={styles.categoriesGrid}>
                {defaultCategories.map((category) => {
                  const icon = CATEGORY_ICONS[category] || '🏷️';
                  return (
                    <Pressable
                      key={category}
                      onPress={() => handleNavigate('/(tabs)/explore')}
                      style={({ pressed }) => [
                        styles.categoryCard,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{icon}</Text>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 3. PROMO OFFER CARD */}
              <View style={styles.promoCard}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>LIMITED OFFER</Text>
                </View>
                <Text style={styles.promoTitle}>Flat 20% Extra Off</Text>
                <Text style={styles.promoSubtitle}>Use coupon code LUXE20 at checkout</Text>
              </View>

              {/* 4. CUSTOMER SUPPORT & ACCOUNT */}
              <Text style={styles.sectionHeading}>SUPPORT & SETTINGS</Text>
              <View style={styles.menuList}>
                <Pressable
                  onPress={() => {
                    setMenuVisible(false);
                    Alert.alert(
                      '24/7 Support',
                      'Contact our concierge team at support@luxestore.com or call +1 (800) 555-0199'
                    );
                  }}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="headset-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>Help & 24/7 Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate('/edit-profile')}
                  style={styles.menuItem}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="settings-outline" size={19} color="#111827" />
                    <Text style={styles.menuItemText}>Account Settings</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </Pressable>

                {user && (
                  <Pressable
                    onPress={handleLogout}
                    style={[styles.menuItem, styles.logoutItem]}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name="log-out-outline" size={19} color="#E11D48" />
                      <Text style={[styles.menuItemText, { color: '#E11D48' }]}>
                        Log Out
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>

              <View style={styles.drawerFooter}>
                <Text style={styles.drawerFooterText}>
                  LUXE STORE v1.0.0 • All Rights Reserved
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerSolid: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B89758',
    marginLeft: 3,
    marginBottom: 4,
  },
  titleWrapper: {
    marginLeft: 8,
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
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  activeIconButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Exact 3-line hamburger menu styling
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  hamburgerIcon: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hamburgerBar: {
    width: 20,
    height: 2.5,
    backgroundColor: '#111827',
    borderRadius: 2,
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
  cartBadge: {
    backgroundColor: '#B89758',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // Modal / Drawer Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContent: {
    width: SCREEN_WIDTH * 0.82,
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal: 18,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  drawerBrandText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  drawerBrandSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  drawerScroll: {
    paddingVertical: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B89758',
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  pillBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  promoCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#B89758',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  drawerFooter: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  drawerFooterText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
