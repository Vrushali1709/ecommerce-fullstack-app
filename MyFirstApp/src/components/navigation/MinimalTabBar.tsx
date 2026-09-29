import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

import { Tabs } from 'expo-router';

export type BottomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];


type TabConfig = {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const TAB_CONFIGS: Record<string, TabConfig> = {
  home: {
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  explore: {
    label: 'Explore',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
  },
  cart: {
    label: 'Cart',
    activeIcon: 'bag-handle',
    inactiveIcon: 'bag-handle-outline',
  },
  wishlist: {
    label: 'Saved',
    activeIcon: 'heart',
    inactiveIcon: 'heart-outline',
  },
  profile: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

export default function MinimalTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  // Bottom padding considering device safe area
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.navBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] || { options: {} };
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || {
            label: options.title || route.name,
            activeIcon: 'grid',
            inactiveIcon: 'grid-outline',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Dynamic badge count
          let badgeCount = 0;
          if (route.name === 'cart') {
            badgeCount = cartCount;
          } else if (route.name === 'wishlist') {
            badgeCount = wishlist.length;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={22}
                  color={isFocused ? '#111827' : '#9CA3AF'}
                />

                {/* Badge for Cart & Wishlist */}
                {badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>

              {/* Minimal Active Indicator Dot */}
              <View
                style={[
                  styles.indicatorDot,
                  isFocused ? styles.activeIndicatorDot : styles.inactiveIndicatorDot,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 10,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    position: 'relative',
  },
  activeIconContainer: {
    backgroundColor: '#F3F4F6',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  inactiveTabLabel: {
    fontWeight: '500',
    color: '#9CA3AF',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  activeIndicatorDot: {
    backgroundColor: '#111827',
  },
  inactiveIndicatorDot: {
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#111827',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
});
