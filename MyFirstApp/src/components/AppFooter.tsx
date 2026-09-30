import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface AppFooterProps {
  onScrollToTop?: () => void;
  showNewsletter?: boolean;
}

export default function AppFooter({
  onScrollToTop,
  showNewsletter = true,
}: AppFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!newsletterEmail.trim()) {
      Alert.alert('Newsletter', 'Please enter your email address.');
      return;
    }
    if (!newsletterEmail.includes('@') || !newsletterEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubscribed(true);
    Alert.alert(
      'Subscribed 🎉',
      'Thank you for subscribing! You will receive our latest updates and exclusive offers.'
    );
    setNewsletterEmail('');
  };

  const handleLinkPress = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'Close', style: 'cancel' }]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Newsletter Signup */}
      {showNewsletter && (
        <View style={styles.newsletterCard}>
          <View style={styles.newsletterHeader}>
            <View style={styles.newsletterBadge}>
              <Ionicons name="mail-unread-outline" size={16} color="#FFFFFF" />
              <Text style={styles.newsletterBadgeText}>VIP ACCESS</Text>
            </View>
            <Text style={styles.newsletterTitle}>Join the Club</Text>
            <Text style={styles.newsletterSubtitle}>
              Get 15% off your first order and exclusive access to new drops.
            </Text>
          </View>

          {isSubscribed ? (
            <View style={styles.subscribedBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.subscribedText}>
                You are subscribed to exclusive updates!
              </Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                value={newsletterEmail}
                onChangeText={setNewsletterEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputField}
              />
              <Pressable
                onPress={handleSubscribe}
                style={({ pressed }) => [
                  styles.subscribeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* 3. Brand & Quick Links */}
      <View style={styles.brandSection}>
        <View style={styles.brandHeaderRow}>
          <View>
            <Text style={styles.brandName}>STORE.</Text>
            <Text style={styles.brandTagline}>
              Curated minimal essentials for everyday modern life.
            </Text>
          </View>

          {onScrollToTop && (
            <Pressable
              onPress={onScrollToTop}
              style={({ pressed }) => [
                styles.backToTopButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to top"
            >
              <Ionicons name="arrow-up" size={18} color="#111827" />
            </Pressable>
          )}
        </View>

        {/* Links Grid */}
        <View style={styles.linksGrid}>
          {/* Col 1 */}
          <View style={styles.linkColumn}>
            <Text style={styles.linkGroupTitle}>SHOP</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/home')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>All Products</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Explore Categories</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/wishlist')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Saved Wishlist</Text>
            </Pressable>
          </View>

          {/* Col 2 */}
          <View style={styles.linkColumn}>
            <Text style={styles.linkGroupTitle}>ORDERS</Text>
            <Pressable
              onPress={() => router.push('/orders')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Order History</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/addresses')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Saved Addresses</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/cart')}
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Shopping Cart</Text>
            </Pressable>
          </View>

          {/* Col 3 */}
          <View style={styles.linkColumn}>
            <Text style={styles.linkGroupTitle}>SUPPORT</Text>
            <Pressable
              onPress={() =>
                handleLinkPress(
                  '24/7 Support',
                  'You can contact our support team at support@store.minimal or call +1 (800) 555-0199.'
                )
              }
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Help & FAQ</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                handleLinkPress(
                  'Shipping Policy',
                  'Orders are delivered in 2-4 business days. Free standard shipping applies to all orders over $100.'
                )
              }
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Shipping Info</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                handleLinkPress(
                  'Privacy Policy',
                  'We take your privacy seriously. Your data is encrypted and never sold or shared with third parties.'
                )
              }
              style={styles.linkPressable}
            >
              <Text style={styles.linkItem}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.socialRow}>
          <Pressable
            onPress={() =>
              Alert.alert('Social', 'Opening Instagram profile...')
            }
            style={styles.socialIcon}
          >
            <Ionicons name="logo-instagram" size={18} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Social', 'Opening Twitter / X profile...')
            }
            style={styles.socialIcon}
          >
            <Ionicons name="logo-twitter" size={18} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Social', 'Opening GitHub repository...')
            }
            style={styles.socialIcon}
          >
            <Ionicons name="logo-github" size={18} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Support Email', 'support@store.minimal')
            }
            style={styles.socialIcon}
          >
            <Ionicons name="mail-outline" size={18} color="#111827" />
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Copyright & Version Info */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} STORE Inc. All rights reserved.
          </Text>
          <Text style={styles.versionText}>v1.0.0 • Crafted with React Native</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingBottom: 24,
  },

  // Newsletter Card
  newsletterCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  newsletterHeader: {
    marginBottom: 16,
  },
  newsletterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  newsletterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  newsletterSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
  },
  inputField: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subscribeButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
  subscribedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  subscribedText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },

  // Brand Section
  brandSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  brandHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 16,
  },
  backToTopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  // Links Grid
  linksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  linkColumn: {
    flex: 1,
  },
  linkGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  linkPressable: {
    paddingVertical: 4,
  },
  linkItem: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Social Row
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'column',
    gap: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 10,
    color: '#D1D5DB',
  },
});
